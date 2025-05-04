import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { google } from 'googleapis';
import mime from 'mime-types';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { readFileSync } from 'fs';

dotenv.config();

const POSTS_JSON = path.resolve('./public/posts.json');
const ARCHIVE_DIR = path.resolve('./archive');
const IMAGE_FOLDER_NAME = 'AutoPostImages';

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

async function downloadFile(fileId, fileName) {
  const dest = path.join('/tmp', fileName);
  const stream = (await import('fs')).createWriteStream(dest);
  await new Promise((resolve, reject) => {
    drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' }, (err, res) => {
      if (err) return reject(err);
      res.data.pipe(stream).on('finish', resolve).on('error', reject);
    });
  });
  return dest;
}

async function moveFileToDriveArchive(fileId, archiveId) {
  const file = await drive.files.get({ fileId, fields: 'parents' });
  const previousParents = file.data.parents.join(',');
  await drive.files.update({
    fileId,
    addParents: archiveId,
    removeParents: previousParents,
    fields: 'id, parents',
  });
}

async function updatePostsJson(imageUrl) {
  let posts = [];
  try {
    const data = await fs.readFile(POSTS_JSON, 'utf-8');
    posts = JSON.parse(data);
  } catch {
    posts = [];
  }
  posts.push({ image_url: imageUrl });

  const updatedContent = JSON.stringify(posts, null, 2);
  await fs.writeFile(POSTS_JSON, updatedContent);
  await commitToGitHub(updatedContent, 'public/posts.json');
}

async function commitToGitHub(content, targetPath) {
  const repo = 'auto_post_dashboard';
  const owner = 'WELCOMETOTHETRIBE';
  const branch = 'main';
  const token = process.env.GH_PAT;

  const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${targetPath}`;
  const getRes = await fetch(getUrl, {
    headers: { Authorization: `token ${token}` }
  });
  const getData = await getRes.json();

  const updateRes = await fetch(getUrl, {
    method: 'PUT',
    headers: {
      Authorization: `token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `🤖 Update ${targetPath}`,
      content: Buffer.from(content).toString('base64'),
      sha: getData.sha,
      branch,
    })
  });

  if (!updateRes.ok) {
    throw new Error(`GitHub API error: ${updateRes.statusText}`);
  }
}

export async function runTriggerScript() {
  const folderId = await getFolderIdByName(IMAGE_FOLDER_NAME);
  const archiveId = await getFolderIdByName('AutoPostArchive');

  if (!folderId || !archiveId) {
    throw new Error('Image or Archive folder not found on Google Drive.');
  }

  const files = await listImageFiles(folderId);
  if (files.length === 0) return 'No new images found.';

  for (const file of files) {
    const ext = file.mimeType === 'image/heic' ? '.jpg' : path.extname(file.name);
    const newFileName = file.name.replace(/\.[^/.]+$/, '') + ext;
    const tempPath = await downloadFile(file.id, newFileName);

    const finalPath = path.join(ARCHIVE_DIR, newFileName);
    if (file.mimeType === 'image/heic') {
      await sharp(tempPath).jpeg().toFile(finalPath);
    } else {
      await fs.copyFile(tempPath, finalPath);
    }

    const githubImageUrl = `https://raw.githubusercontent.com/WELCOMETOTHETRIBE/auto_post_dashboard/main/archive/${newFileName}`;
    await updatePostsJson(githubImageUrl);
    await moveFileToDriveArchive(file.id, archiveId);
  }

  return `✅ Processed ${files.length} images.`;
}
