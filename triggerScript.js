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
  await fs.mkdir(dirPath, { recursive: true });
}

async function updateRepo() {
  const gitFolder = path.join(WORK_DIR, '.git');
  if (!(await fileExists(gitFolder))) {
    console.log('🧱 Initializing Git repository...');
    await execAsync(`git init`, { cwd: WORK_DIR });
    await execAsync(`git remote add origin "${GITHUB_REMOTE_URL}"`, { cwd: WORK_DIR });
  }

  // Configure identity
  await execAsync(`git config user.name "AutoPostBot"`, { cwd: WORK_DIR });
  await execAsync(`git config user.email "autopost@wttt.app"`, { cwd: WORK_DIR });

  // Clean working tree
  await execAsync(`git reset --hard`, { cwd: WORK_DIR });
  await execAsync(`git clean -fd`, { cwd: WORK_DIR });

  // Create main branch if missing
  try {
    await execAsync(`git rev-parse --verify main`, { cwd: WORK_DIR });
  } catch {
    console.log('🌱 Creating main branch');
    await execAsync(`git checkout -b main`, { cwd: WORK_DIR });
  }

  // Pull with safety net
  try {
    await execAsync(`git pull origin main --allow-unrelated-histories`, { cwd: WORK_DIR });
  } catch (err) {
    console.warn('⚠️ git pull failed or skipped:', err.message);
  }
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
      console.log('🟡 No image files found.');
      return 'No new images to process.';
    }

    for (const file of imageFiles) {
      const fullPath = path.join(IMAGE_DIR, file);
      let finalPath = fullPath;
      let archiveName = file;

      // Convert HEIC to JPG
      if (file.toLowerCase().endsWith('.heic')) {
        const jpgName = file.replace(/\.heic$/i, '.jpg');
        const newPath = path.join(IMAGE_DIR, jpgName);
        console.log(`🌀 Converting ${file} to ${jpgName}...`);
        await sharp(fullPath).jpeg().toFile(newPath);
        finalPath = newPath;
        archiveName = jpgName;
      }

      // Stage new image
      await execAsync(`git add "${finalPath}"`, { cwd: WORK_DIR });
      await execAsync(`git commit -m "Added new image: ${archiveName}"`, { cwd: WORK_DIR });
      await execAsync(`git push origin main`, { cwd: WORK_DIR });

      const imageUrl = `https://raw.githubusercontent.com/WELCOMETOTHETRIBE/auto_post_dashboard/main/archive/${archiveName}`;
      await updatePostsJson(imageUrl);

      // Move to archive and push again
      const archivePath = path.join(ARCHIVE_DIR, archiveName);
      await fs.rename(finalPath, archivePath);
      await execAsync(`git add "${archivePath}"`, { cwd: WORK_DIR });
      await execAsync(`git commit -m "Archived image: ${archiveName}"`, { cwd: WORK_DIR });
      await execAsync(`git push origin main`, { cwd: WORK_DIR });
    }

    // Final commit for posts.json or any remaining updates
    await execAsync(`git add -A`, { cwd: WORK_DIR });
    await execAsync(`git commit -m "Automated commit: updates to posts.json and image files"`, { cwd: WORK_DIR });
    await execAsync(`git push origin main`, { cwd: WORK_DIR });

    return '✅ All tasks completed successfully.';
  } catch (err) {
    console.error('❌ runTriggerScript failed:', err);
    throw err;
  }
}
