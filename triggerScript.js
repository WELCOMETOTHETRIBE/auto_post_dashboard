// triggerScript.js
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import sharp from 'sharp';
import dotenv from 'dotenv';

dotenv.config();

const execAsync = promisify(exec);

const WORK_DIR = path.resolve('./');
const ARCHIVE_DIR = path.join(WORK_DIR, 'archive');
const IMAGE_DIR = path.join(WORK_DIR, 'new_images');
const POSTS_JSON = path.join(WORK_DIR, 'public/posts.json');
const GITHUB_REMOTE_URL = process.env.GITHUB_REMOTE_URL;

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (err) {
    console.error(`❌ Failed to create directory ${dirPath}:`, err);
  }
}

async function updateRepo() {
  const gitFolder = path.join(WORK_DIR, '.git');
  if (!(await fileExists(gitFolder))) {
    console.log('❌ Not a Git repo. Initializing...');
    await execAsync(`git init`, { cwd: WORK_DIR });
    await execAsync(`git remote add origin ${GITHUB_REMOTE_URL}`, { cwd: WORK_DIR });
  }

  console.log('🧼 Cleaning working tree...');
  await execAsync(`git reset --hard`, { cwd: WORK_DIR });
  await execAsync(`git clean -fd`, { cwd: WORK_DIR });

  console.log('🔄 Pulling from remote repo...');
  await execAsync(`git pull origin main --allow-unrelated-histories || true`, { cwd: WORK_DIR });
}

async function updatePostsJson(imageUrl) {
  let posts = [];
  try {
    const raw = await fs.readFile(POSTS_JSON, 'utf-8');
    posts = JSON.parse(raw);
  } catch {
    posts = [];
  }
  posts.push({ image_url: imageUrl });
  await fs.writeFile(POSTS_JSON, JSON.stringify(posts, null, 2));
  console.log('✔ posts.json updated');
}

export async function runTriggerScript() {
  try {
    await ensureDir(ARCHIVE_DIR);
    await updateRepo();

    const files = await fs.readdir(IMAGE_DIR);
    const imageFiles = files.filter(f => f.match(/\.(jpe?g|png|heic)$/i));

    if (imageFiles.length === 0) {
      console.log('No image files found.');
      return 'No new images to process.';
    }

    for (const file of imageFiles) {
      const fullPath = path.join(IMAGE_DIR, file);
      let finalPath = fullPath;
      let archiveName = file;

      // Convert HEIC to JPG if needed
      if (file.toLowerCase().endsWith('.heic')) {
        const jpgName = file.replace(/\.heic$/i, '.jpg');
        const newPath = path.join(IMAGE_DIR, jpgName);
        console.log(`🌀 Converting ${file} to ${jpgName} using sharp...`);
        await sharp(fullPath).jpeg().toFile(newPath);
        finalPath = newPath;
        archiveName = jpgName;
      }

      const archivePath = path.join(ARCHIVE_DIR, archiveName);
      const imageUrl = `https://raw.githubusercontent.com/WELCOMETOTHETRIBE/auto_post_dashboard/main/archive/${archiveName}`;

      // Add & commit original or converted image
      await execAsync(`git config user.name "AutoPostBot"`, { cwd: WORK_DIR });
      await execAsync(`git config user.email "autopost@wttt.app"`, { cwd: WORK_DIR });
      await execAsync(`git add "${finalPath}"`, { cwd: WORK_DIR });
      await execAsync(`git diff --cached --quiet || git commit -m "Added new image: ${archiveName}"`, { cwd: WORK_DIR });
      await execAsync(`git push origin main`, { cwd: WORK_DIR });

      // Move to archive, add post JSON entry
      await fs.rename(finalPath, archivePath);
      await updatePostsJson(imageUrl);

      // Add & commit archive
      await execAsync(`git add "${archivePath}"`, { cwd: WORK_DIR });
      await execAsync(`git diff --cached --quiet || git commit -m "Archived image: ${archiveName}"`, { cwd: WORK_DIR });
      await execAsync(`git push origin main`, { cwd: WORK_DIR });
    }

    // Commit and push posts.json if updated
    await execAsync(`git add ${POSTS_JSON}`, { cwd: WORK_DIR });
    await execAsync(`git diff --cached --quiet || git commit -m "Updated posts.json"`, { cwd: WORK_DIR });
    await execAsync(`git push origin main`, { cwd: WORK_DIR });

    return '✅ All tasks completed successfully.';
  } catch (err) {
    console.error('❌ runTriggerScript failed:', err);
    throw err;
  }
}
