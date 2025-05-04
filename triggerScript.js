// triggerScript.js
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import sharp from 'sharp';

const execAsync = promisify(exec);

const WORK_DIR = path.resolve('./');
const ARCHIVE_DIR = path.join(WORK_DIR, 'archive');
const IMAGE_DIR = path.join(WORK_DIR, 'new_images');
const POSTS_JSON = path.join(WORK_DIR, 'public/posts.json');
const GITHUB_REPO_URL = 'https://github.com/WELCOMETOTHETRIBE/auto_post_dashboard.git';

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
    await execAsync(`git remote add origin ${GITHUB_REPO_URL}`, { cwd: WORK_DIR });
  }

  // ⛔ Clear lock file if exists
  try {
    await fs.unlink(path.join(gitFolder, 'index.lock'));
  } catch {}

  console.log('🧼 Cleaning working tree...');
  await execAsync(`git reset --hard`, { cwd: WORK_DIR });
  await execAsync(`git clean -fd`, { cwd: WORK_DIR });

  console.log('🔄 Pulling latest from remote...');
  await execAsync(`git checkout -B main`, { cwd: WORK_DIR });
  await execAsync(`git config user.name "AutoPostBot"`, { cwd: WORK_DIR });
  await execAsync(`git config user.email "autopost@wttt.app"`, { cwd: WORK_DIR });
  await execAsync(`git pull origin main --allow-unrelated-histories`, { cwd: WORK_DIR });
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

      if (file.toLowerCase().endsWith('.heic')) {
        const jpgName = file.replace(/\.heic$/i, '.jpg');
        const newPath = path.join(IMAGE_DIR, jpgName);
        console.log(`🌀 Converting ${file} to ${jpgName} using sharp...`);
        await sharp(fullPath).jpeg().toFile(newPath);
        finalPath = newPath;
        archiveName = jpgName;
      }

      const archivePath = path.join(ARCHIVE_DIR, archiveName);
      const alreadyArchived = await fileExists(archivePath);
      if (alreadyArchived) {
        console.log(`⚠️ Skipping ${archiveName} — already archived.`);
        continue;
      }

      await fs.rename(finalPath, archivePath);
      await execAsync(`git add "${archivePath}"`, { cwd: WORK_DIR });
      await execAsync(`git commit -m "Archived image: ${archiveName}"`, { cwd: WORK_DIR });

      await execAsync(`git push origin main`, { cwd: WORK_DIR });
      const imageUrl = `https://raw.githubusercontent.com/WELCOMETOTHETRIBE/auto_post_dashboard/main/archive/${archiveName}`;
      await updatePostsJson(imageUrl);
    }

    await execAsync(`git add "${POSTS_JSON}"`, { cwd: WORK_DIR });
    await execAsync(`git commit -m "Updated posts.json with new image URLs"`, { cwd: WORK_DIR });
    await execAsync(`git push origin main`, { cwd: WORK_DIR });

    return '✅ All tasks completed successfully.';
  } catch (err) {
    console.error('❌ runTriggerScript failed:', err);
    throw err;
  }
}
