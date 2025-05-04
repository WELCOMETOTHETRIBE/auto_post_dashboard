import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { google } from 'googleapis';
import mime from 'mime-types';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const POSTS_JSON = path.resolve('./public/posts.json');
const IMAGE_FOLDER_NAME = 'AutoPostImages';
const ARCHIVE_FOLDER_NAME = 'AutoPostArchive';

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
  const file = await fs.open(dest, 'w');
  const writable = file.createWriteStream();

  await new Promise((resolve, reject) => {
    drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' }, (err, res) => {
      if (err) return reject(err);
      res.data.pipe(writable).on('finish', resolve).on('error', reject);
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

async function updatePostsJson(newPost) {
  let posts = [];
  try {
    const data = await fs.readFile(POSTS_JSON, 'utf-8');
    posts = JSON.parse(data);
  } catch {
    posts = [];
  }
  posts.push(newPost);
  await fs.writeFile(POSTS_JSON, JSON.stringify(posts, null, 2));
  return JSON.stringify(posts, null, 2);
}

async function pushToGitHub(contentString) {
  const GH_PAT = process.env.GH_PAT;
  const repo = 'WELCOMETOTHETRIBE/auto_post_dashboard';
  const filePath = 'public/posts.json';
  const branch = 'main';

  // Get the current SHA for posts.json
  const getRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
    headers: {
      Authorization: `token ${GH_PAT}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });
  const fileData = await getRes.json();

  // Update the file with new content
  const putRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
    method: 'PUT',
    headers: {
      Authorization: `token ${GH_PAT}`,
      Accept: 'application/vnd.github.v3+json',
    },
    body: JSON.stringify({
      message: `📸 Auto-update posts.json with new image`,
      content: Buffer.from(contentString).toString('base64'),
      sha: fileData.sha,
      branch,
    }),
  });

  if (!putRes.ok) {
    const errText = await putRes.text();
    throw new Error(`GitHub API update failed: ${errText}`);
  }
}

export async function runTriggerScript() {
  const folderId = await getFolderIdByName(IMAGE_FOLDER_NAME);
  const archiveId = await getFolderIdByName(ARCHIVE_FOLDER_NAME);

  if (!folderId || !archiveId) throw new Error('Image or Archive folder not found on Google Drive.');

  const files = await listImageFiles(folderId);
  if (files.length === 0) return 'No new images found.';

  const updatedPosts = [];

  for (const file of files) {
    const filePath = await downloadFile(file.id);

    let finalPath = filePath;
    let newFileName = file.name;

    if (file.mimeType === 'image/heic') {
      newFileName = file.name.replace(/\.[^/.]+$/, '.jpg');
      const jpgPath = `/tmp/${newFileName}`;
      await sharp(filePath).jpeg().toFile(jpgPath);
      finalPath = jpgPath;
    }

    const fileBuffer = await fs.readFile(finalPath);
    const uploaded = await drive.files.create({
      requestBody: {
        name: newFileName,
        parents: [archiveId],
        mimeType: mime.lookup(newFileName),
      },
      media: {
        mimeType: mime.lookup(newFileName),
        body: fs.createReadStream(finalPath),
      },
      fields: 'id',
    });

    const fileUrl = `https://drive.google.com/uc?id=${uploaded.data.id}`;
    updatedPosts.push({ image_url: fileUrl });

    await moveFileToFolder(file.id, archiveId);
  }

  const updatedJsonString = await updatePostsJson(updatedPosts[0]);
  await pushToGitHub(updatedJsonString);

  return `✅ Processed and published ${updatedPosts.length} images.`;
}
