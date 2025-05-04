import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { google } from 'googleapis';
import mime from 'mime-types';
import dotenv from 'dotenv';
import simpleGit from 'simple-git';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WORK_DIR = path.resolve(__dirname);
const POSTS_JSON = path.join(WORK_DIR, 'public/posts.json');

dotenv.config();

const keyBuffer = Buffer.from(process.env.GOOGLE_DRIVE_KEY_BASE64, 'base64');
const credentials = JSON.parse(keyBuffer.toString());

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/drive']
});
const drive = google.drive({ version: 'v3', auth });
const IMAGE_FOLDER_NAME = 'AutoPostImages';
const ARCHIVE_FOLDER_NAME = 'AutoPostArchive';

async function getFolderIdByName(name) {
  const res = await drive.files.list({
    q: `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name)'
  });
  return res.data.files?.[0]?.id || null;
}

async function listImageFiles(folderId) {
  const res = await drive.files.list({
    q: `'${folderId}' in parents and mimeType contains 'image/' and trashed=false`,
    fields: 'files(id, name, mimeType)'
  });
  return res.data.files || [];
}

async function downloadFile(fileId, fileName) {
  const dest = `/tmp/${fileName}`;
  const destStream = fs.createWriteStream(dest);
  await new Promise((resolve, reject) => {
    drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' }, (err, res) => {
      if (err) return reject(err);
      res.data.pipe(destStream).on('finish', resolve).on('error', reject);
    });
  });
  return dest;
}

async function moveFileToFolder(fileId, newParentId) {
  const file = await drive.files.get({ fileId, fields: 'parents' });
  const previousParents = file.data.parents.join(',');
  await drive.files.update({
    fileId,
    addParents: newParentId,
    removeParents: previousParents,
    fields: 'id, parents'
  });
}

async function updatePostsJson(imageUrl) {
  let posts = [];
  try {
    const data = await fsp.readFile(POSTS_JSON, 'utf-8');
    posts = JSON.parse(data);
  } catch (err) {
    posts = [];
  }
  posts.push({ image_url: imageUrl });
  await fsp.writeFile(POSTS_JSON, JSON.stringify(posts, null, 2));
}

export async function runTriggerScript() {
  const imageFolderId = await getFolderIdByName(IMAGE_FOLDER_NAME);
  const archiveFolderId = await getFolderIdByName(ARCHIVE_FOLDER_NAME);
  if (!imageFolderId || !archiveFolderId) throw new Error('Drive folders not found.');

  const files = await listImageFiles(imageFolderId);
  if (files.length === 0) return 'No new images found.';

  for (const file of files) {
    let filePath = await downloadFile(file.id, file.name);
    let finalPath = filePath;
    let finalName = file.name;

    if (file.mimeType === 'image/heic') {
      finalName = file.name.replace(/\.[^/.]+$/, '.jpg');
      finalPath = `/tmp/${finalName}`;
      await sharp(filePath).jpeg().toFile(finalPath);
    }

    const media = fs.createReadStream(finalPath);
    const uploaded = await drive.files.create({
      requestBody: {
        name: finalName,
        parents: [archiveFolderId],
        mimeType: mime.lookup(finalName) || 'image/jpeg'
      },
      media: {
        mimeType: mime.lookup(finalName),
        body: media
      },
      fields: 'id'
    });

    const imageUrl = `https://drive.google.com/uc?id=${uploaded.data.id}`;
    await updatePostsJson(imageUrl);
    await moveFileToFolder(file.id, archiveFolderId);
  }

  const git = simpleGit(WORK_DIR);
  await git.add('./public/posts.json');
  await git.commit('✅ Auto-update: new images pushed');
  await git.push(['--repo', process.env.GITHUB_REMOTE_URL]);

  return `✅ Processed and pushed ${files.length} image(s).`;
}
