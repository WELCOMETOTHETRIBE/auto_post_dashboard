import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import mime from 'mime-types';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { createWriteStream, createReadStream } from 'fs';

dotenv.config();

const POSTS_JSON = path.resolve('./public/posts.json');
const ARCHIVE_DIR = path.resolve('./archive');
const IMAGE_FOLDER_NAME = 'AutoPostImages';
const ARCHIVE_FOLDER_NAME = 'AutoPostArchive';

const keyBuffer = Buffer.from(process.env.GOOGLE_DRIVE_KEY_BASE64, 'base64');
const credentials = JSON.parse(keyBuffer.toString());

import { google } from 'googleapis';
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

async function downloadFile(fileId, outputPath) {
  const stream = createWriteStream(outputPath);
  await new Promise((resolve, reject) => {
    drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' }, (err, res) => {
      if (err) return reject(err);
      res.data.pipe(stream).on('finish', resolve).on('error', reject);
    });
  });
  return outputPath;
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

async function updatePostsJson(newEntry) {
  let posts = [];
  try {
    const data = await fs.readFile(POSTS_JSON, 'utf-8');
    posts = JSON.parse(data);
  } catch {
    posts = [];
  }
  posts.push({ image_url: newEntry });

  const updatedContent = JSON.stringify(posts, null, 2);
  await fs.writeFile(POSTS_JSON, updatedContent);
  await commitFileToGitHub('public/posts.json', updatedContent, '🤖 Update posts.json');
}

async function commitFileToGitHub(filePath, content, message) {
  const repo = 'auto_post_dashboard';
  const owner = 'WELCOMETOTHETRIBE';
  const branch = 'main';
  const token = process.env.GH_PAT;
  const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

  const getRes = await fetch(getUrl, { headers: { Authorization: `token ${token}` } });
  const getData = await getRes.json();

  const res = await fetch(getUrl, {
    method: 'PUT',
    headers: {
      Authorization: `token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      content: Buffer.from(content).toString('base64'),
      sha: getData.sha,
      branch,
    })
  });

  if (!res.ok) {
    throw new Error(`GitHub API error while committing ${filePath}: ${res.statusText}`);
  }
}

async function commitImageToGitHub(imagePath, imageName) {
  const content = await fs.readFile(imagePath);
  await commitFileToGitHub(`archive/${imageName}`, content.toString('base64'), `🖼️ Upload image ${imageName}`);
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
    const rawPath = `/tmp/${file.name}`;
    await downloadFile(file.id, rawPath);

    let finalPath = rawPath;
    let finalName = file.name;
    if (file.mimeType === 'image/heic') {
      finalName = file.name.replace(/\.[^/.]+$/, '.jpg');
      const jpgPath = `/tmp/${finalName}`;
      await sharp(rawPath).jpeg().toFile(jpgPath);
      finalPath = jpgPath;
    }

    const localArchivePath = path.join(ARCHIVE_DIR, finalName);
    await fs.copyFile(finalPath, localArchivePath);
    await commitImageToGitHub(localArchivePath, finalName);

    const githubRawUrl = `https://raw.githubusercontent.com/WELCOMETOTHETRIBE/auto_post_dashboard/main/archive/${finalName}`;
    await updatePostsJson(githubRawUrl);
    await moveFileToFolder(file.id, archiveId);
  }

  return `✅ Uploaded and committed ${files.length} image(s).`;
}
