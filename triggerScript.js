// triggerScript.js
import fs from 'fs/promises';
import path from 'path';
import { google } from 'googleapis';
import mime from 'mime-types';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const POSTS_JSON = path.resolve('./public/posts.json');
const IMAGE_FOLDER_NAME = 'AutoPostImages';
const ARCHIVE_FOLDER_NAME = 'AutoPostArchive';
const GITHUB_API_URL = 'https://api.github.com';
const REPO_OWNER = 'WELCOMETOTHETRIBE';
const REPO_NAME = 'auto_post_dashboard';
const BRANCH = 'main';

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

async function updatePostsJson(imageUrl) {
  let posts = [];
  try {
    const data = await fs.readFile(POSTS_JSON, 'utf-8');
    posts = JSON.parse(data);
  } catch {
    posts = [];
  }
  posts.push({ image_url: imageUrl });
  await fs.writeFile(POSTS_JSON, JSON.stringify(posts, null, 2));
}

async function pushPostsToGitHub() {
  const fileContent = await fs.readFile(POSTS_JSON, 'utf-8');
  const encodedContent = Buffer.from(fileContent).toString('base64');
  const token = process.env.GH_PAT;

  // Get SHA of existing file
  const shaRes = await fetch(`${GITHUB_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}/contents/public/posts.json`, {
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json'
    }
  });
  const shaData = await shaRes.json();
  const sha = shaData.sha;

  // Push new version
  const updateRes = await fetch(`${GITHUB_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}/contents/public/posts.json`, {
    method: 'PUT',
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json'
    },
    body: JSON.stringify({
      message: '📸 New post added via trigger script',
      content: encodedContent,
      sha,
      branch: BRANCH
    })
  });

  if (!updateRes.ok) {
    const errorText = await updateRes.text();
    throw new Error(`Failed to push to GitHub: ${errorText}`);
  }
}

export async function runTriggerScript() {
  const folderId = await getFolderIdByName(IMAGE_FOLDER_NAME);
  const archiveId = await getFolderIdByName(ARCHIVE_FOLDER_NAME);

  if (!folderId || !archiveId) {
    throw new Error('❌ Google Drive folder(s) not found.');
  }

  const files = await listImageFiles(folderId);
  if (files.length === 0) return 'No new images found.';

  for (const file of files) {
    const fileId = file.id;

    // Generate a publicly shareable link
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    const imageUrl = `https://drive.google.com/uc?id=${fileId}`;
    await updatePostsJson(imageUrl);
    await moveFileToFolder(fileId, archiveId);
  }

  await pushPostsToGitHub();
  return `✅ Processed and committed ${files.length} new images.`;
}
