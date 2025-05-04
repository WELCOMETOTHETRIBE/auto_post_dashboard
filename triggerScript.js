import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { google } from 'googleapis';
import mime from 'mime-types';
import dotenv from 'dotenv';
import simpleGit from 'simple-git';

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
  const stream = fs.createWriteStream(dest);
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

async function updatePostsJson(imageUrl) {
  let posts = [];
  try {
    const data = await fsp.readFile(POSTS_JSON, 'utf-8');
    posts = JSON.parse(data);
  } catch {
    posts = [];
  }
  posts.push({ image_url: imageUrl });
  await fsp.writeFile(POSTS_JSON, JSON.stringify(posts, null, 2));
}

async function commitPostsJsonUpdate() {
  const git = simpleGit();
  await git.add('./public/posts.json');
  await git.commit('🔁 Update posts.json with new Google Drive image(s)');
  await git.push('origin', 'main');
}

export async function runTriggerScript() {
  const folderId = await getFolderIdByName(IMAGE_FOLDER_NAME);
  const archiveId = await getFolderIdByName(ARCHIVE_FOLDER_NAME);

  if (!folderId || !archiveId) {
    throw new Error('❌ Image or Archive folder not found on Google Drive.');
  }

  const files = await listImageFiles(folderId);
  if (files.length === 0) return 'No new images found.';

  let updated = false;

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

    const fileMetadata = {
      name: newFileName,
      parents: [archiveId],
      mimeType: mime.lookup(newFileName),
    };

    const media = {
      mimeType: mime.lookup(newFileName),
      body: fs.createReadStream(finalPath),
    };

    const uploaded = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id',
    });

    await drive.permissions.create({
      fileId: uploaded.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    const fileUrl = `https://drive.google.com/uc?export=view&id=${uploaded.data.id}`;
    await updatePostsJson(fileUrl);
    await moveFileToFolder(file.id, archiveId);
    updated = true;
  }

  if (updated) {
    await commitPostsJsonUpdate();
  }

  return `✅ Processed ${files.length} image(s)`;
}
