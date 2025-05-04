import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { google } from 'googleapis';
import mime from 'mime-types';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const POSTS_JSON_PATH = path.resolve('./public/posts.json');
const IMAGE_FOLDER_NAME = 'AutoPostImages';
const ARCHIVE_FOLDER_NAME = 'AutoPostArchive';

const GITHUB_REPO = 'WELCOMETOTHETRIBE/auto_post_dashboard';
const POSTS_JSON_FILE_PATH = 'public/posts.json';
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/contents/${POSTS_JSON_FILE_PATH}`;
const GITHUB_TOKEN = process.env.GH_PAT;

const keyBuffer = Buffer.from(process.env.GOOGLE_DRIVE_KEY_BASE64, 'base64');
const credentials = JSON.parse(keyBuffer.toString());

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

async function getFolderIdByName(name) {
  const res = await drive.files.list({
    q: `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name)',
  });
  const folder = res.data.files.find(f => f.name === name);
  return folder ? folder.id : null;
}

async function listImageFiles(folderId) {
  const res = await drive.files.list({
    q: `'${folderId}' in parents and mimeType contains 'image/' and trashed=false`,
    fields: 'files(id, name, mimeType)',
  });
  return res.data.files;
}

async function downloadFile(fileId) {
  const dest = `/tmp/${fileId}`;
  const stream = (await fs.open(dest, 'w')).createWriteStream();
  await new Promise((resolve, reject) => {
    drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' }, (err, res) => {
      if (err) return reject(err);
      res.data.pipe(stream).on('finish', resolve).on('error', reject);
    });
  });
  return dest;
}

async function moveFileToFolder(fileId, folderId) {
  const file = await drive.files.get({ fileId, fields: 'parents' });
  const previousParents = file.data.parents.join(',');
  await drive.files.update({
    fileId,
    addParents: folderId,
    removeParents: previousParents,
    fields: 'id, parents',
  });
}

async function updatePostsJsonViaGitHub(newEntry) {
  const res = await fetch(GITHUB_API_URL, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!res.ok) throw new Error(`Failed to fetch posts.json: ${res.status}`);
  const fileData = await res.json();
  const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
  const posts = JSON.parse(content);

  posts.push(newEntry);
  const updatedContent = Buffer.from(JSON.stringify(posts, null, 2)).toString('base64');

  const updateRes = await fetch(GITHUB_API_URL, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
    },
    body: JSON.stringify({
      message: `Add image post: ${newEntry.image_url}`,
      content: updatedContent,
      sha: fileData.sha,
    }),
  });

  if (!updateRes.ok) throw new Error(`Failed to update posts.json: ${updateRes.status}`);
}

export async function runTriggerScript() {
  const folderId = await getFolderIdByName(IMAGE_FOLDER_NAME);
  const archiveId = await getFolderIdByName(ARCHIVE_FOLDER_NAME);

  if (!folderId || !archiveId) {
    throw new Error('Image or Archive folder not found on Google Drive.');
  }

  const files = await listImageFiles(folderId);
  if (files.length === 0) return 'No new images found.';

  for (const file of files) {
    const filePath = await downloadFile(file.id);

    // HEIC to JPG if needed
    let finalPath = filePath;
    let newFileName = file.name;
    if (file.mimeType === 'image/heic') {
      newFileName = file.name.replace(/\.[^/.]+$/, '.jpg');
      const jpgPath = `/tmp/${newFileName}`;
      await sharp(filePath).jpeg().toFile(jpgPath);
      finalPath = jpgPath;
    }

    // Upload the converted image to archive
    const bodyStream = await fs.readFile(finalPath);
    const uploaded = await drive.files.create({
      requestBody: {
        name: newFileName,
        parents: [archiveId],
        mimeType: mime.lookup(newFileName),
      },
      media: {
        mimeType: mime.lookup(newFileName),
        body: bodyStream,
      },
      fields: 'id, webContentLink, webViewLink',
    });

    const fileUrl = `https://drive.google.com/uc?id=${uploaded.data.id}`;
    await updatePostsJsonViaGitHub({ image_url: fileUrl });
    await moveFileToFolder(file.id, archiveId);
  }

  return `✅ Processed ${files.length} images.`;
}
