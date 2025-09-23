// FORCE DEPLOYMENT: 2025-09-03 23:31 UTC - Railway deployment switch
// NUCLEAR FORCE UPDATE: 2025-09-03 23:57 UTC - Massive change to force code update
import express from 'express';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// OpenAI Configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
// Prefer explicit env var, otherwise default to the provided assistant id
const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID || process.env.ASSISTANT_ID || 'asst_ctMxotObRC89Ymd8yNPzd9MI';

let openai = null;
if (OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
  });
}

// AI function using OpenAI Assistants API (v2 beta)
const runAssistant = async (prompt) => {
  if (!openai || !ASSISTANT_ID) {
    return '';
  }

  try {
    // Create a new thread for this request
    const thread = await openai.beta.threads.create();

    // Add the user's message to the thread
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: prompt
    });

    // Create a run with the configured assistant
    let run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: ASSISTANT_ID
    });

    // Poll until the run completes
    while (run.status === 'queued' || run.status === 'in_progress') {
      await new Promise((r) => setTimeout(r, 800));
      run = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }

    if (run.status !== 'completed') {
      console.error('Assistant run did not complete:', run.status);
      return '';
    }

    // Fetch the latest message (assistant response)
    const messages = await openai.beta.threads.messages.list(thread.id, { order: 'desc', limit: 1 });
    const latest = messages.data?.[0];
    const parts = latest?.content || [];
    const textPart = parts.find((p) => p.type === 'text');
    const text = textPart?.text?.value || '';
    return text.trim();
  } catch (error) {
    console.error('OpenAI Assistants API Error:', error?.message || error);
    return '';
  }
};

// Middleware
app.use(express.json());

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// AI and GitHub configuration
// OPENAI_API_KEY and ASSISTANT_ID already declared above
const GH_TOKEN = process.env.GITHUB_TOKEN || '';
const GH_OWNER = process.env.GITHUB_OWNER || 'WELCOMETOTHETRIBE';
const GH_REPO = process.env.GITHUB_REPO || 'auto_post_dashboard';

// Health check endpoint for Railway
app.get('/healthz', (_req, res) => {
  res.json({ 
    ok: true, 
    timestamp: new Date().toISOString(),
    version: 'v1.0.0-recovery',
    environment: process.env.NODE_ENV || 'production'
  });
});

// Version info endpoint to verify current deploy
app.get('/version', (_req, res) => {
  res.json({
    ok: true,
    timestamp: new Date().toISOString(),
    branch: process.env.RAILWAY_GIT_BRANCH || process.env.GIT_BRANCH || null,
    commit: process.env.RAILWAY_GIT_COMMIT_SHA || process.env.GIT_COMMIT || null,
    node: process.version
  });
});

// Minimal env introspection (masked) to verify deployment configuration
app.get('/env', (_req, res) => {
  const mask = (val = '') => (val ? `${val.slice(0, 6)}…${val.slice(-4)}` : null);
  res.json({
    ok: true,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? mask(process.env.OPENAI_API_KEY) : null,
    OPENAI_ASSISTANT_ID: process.env.OPENAI_ASSISTANT_ID || process.env.ASSISTANT_ID || null,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN ? mask(process.env.GITHUB_TOKEN) : null,
    NODE_ENV: process.env.NODE_ENV || null,
    PORT: process.env.PORT || null
  });
});

// GitHub posts proxy API
app.get('/api/git/posts', async (_req, res) => {
  try {
    if (GH_TOKEN && GH_OWNER && GH_REPO) {
      const url = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/public/posts.json`;
      const response = await fetch(url, { 
        headers: { 
          Authorization: `Bearer ${GH_TOKEN}`, 
          'User-Agent': 'tribe-spa' 
        }
      });
      
      if (!response.ok) {
        console.error('GitHub API error:', response.status, response.statusText);
        throw new Error(`GitHub API ${response.status}`);
      }
      
      const data = await response.json();
      // Decode base64 content from GitHub API
      const content = Buffer.from(data.content || '', 'base64').toString('utf8');
      return res.type('application/json').send(content);
    }
    
    // Fallback: local mock data
    console.log('No GitHub token, serving local posts.json');
    return res.sendFile(path.join(__dirname, 'public', 'posts.json'));
  } catch (err) {
    console.error('GIT_LOAD_ERROR:', err.message);
    try {
      // Final fallback: local mock data
      return res.sendFile(path.join(__dirname, 'public', 'posts.json'));
    } catch (fallbackErr) {
      console.error('FALLBACK_ERROR:', fallbackErr.message);
      return res.status(500).json({ error: 'Failed to load posts' });
    }
  }
});

// === AI Endpoints ===

// Caption Generation
app.post('/api/generate-caption', async (req, res) => {
  try {
    const { imageUrl, description } = req.body;
    const prompt = `Generate an engaging social media caption for this image. ${description ? `Image description: ${description}` : ''} Make it viral, engaging, and include relevant emojis.`;
    const caption = await runAssistant(prompt);
    res.json({ caption });
  } catch (error) {
    console.error('Caption Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Hashtag Generation
app.post('/api/generate-hashtags', async (req, res) => {
  try {
    const { caption, description } = req.body;
    const prompt = `Generate 10-15 relevant, viral hashtags for this social media post. Caption: ${caption || 'No caption provided'}. ${description ? `Description: ${description}` : ''} Make them trending and relevant.`;
    const hashtags = await runAssistant(prompt);
    res.json({ hashtags });
  } catch (error) {
    console.error('Hashtag Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Image Analysis
app.post('/api/interpret-image', async (req, res) => {
  try {
    const analysis = await runAssistant(`Analyze this image and describe what you see: ${req.body.description || 'No description provided'}`);
    res.json({ analysis });
  } catch (error) {
    console.error('Image Analysis Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// === Image Upload Endpoint ===
app.post('/api/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { description, platforms, hourDelay, caption, hashtags, product, brand } = req.body;
    
    // Create new post object
    const newPost = {
      id: uuidv4(),
      token_id: uuidv4(),
      image_url: `/uploads/${req.file.filename}`,
      original_filename: req.file.originalname,
      description: description || '',
      platforms: platforms ? platforms.split(',') : [],
      hour_delay: parseInt(hourDelay) || 0,
      caption: caption || '',
      hashtags: hashtags || '',
      product: product || '',
      brand: brand || 'wttt',
      status: 'draft',
      created_at: new Date().toISOString(),
      scheduled_for: hourDelay ? new Date(Date.now() + (parseInt(hourDelay) * 60 * 60 * 1000)).toISOString() : null
    };

    // Add to posts.json
    const postsPath = path.join(__dirname, 'public', 'posts.json');
    let postsData = [];
    
    try {
      if (fs.existsSync(postsPath)) {
        postsData = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));
      }
    } catch (err) {
      console.warn('Could not read existing posts.json, starting fresh');
    }

    postsData.unshift(newPost);
    
    // Write updated posts.json
    fs.writeFileSync(postsPath, JSON.stringify(postsData, null, 2));
    
    console.log('✅ Image uploaded and post created:', newPost.id);
    
    res.json({
      success: true,
      post: newPost,
      message: 'Image uploaded successfully'
    });
    
  } catch (error) {
    console.error('❌ Upload Error:', error);
    res.status(500).json({ 
      error: 'Upload failed', 
      details: error.message 
    });
  }
});

// === OpenAI Assistant Function ===
// Note: runAssistant function is already defined above as a const arrow function
// Removed duplicate function declaration

// === Zapier & Submission Endpoints ===

// Submit to Zapier webhook
app.post('/api/submit', async (req, res) => {
  try {
    console.log("📤 Submitting to Zapier...");
    const zapierRes = await fetch('https://hooks.zapier.com/hooks/catch/17370933/2p0k85d/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    
    if (!zapierRes.ok) {
      throw new Error(`Zapier webhook failed: ${zapierRes.status} ${zapierRes.statusText}`);
    }
    
    const zapierText = await zapierRes.text();
    console.log("✅ Zapier submission complete");

    // Update posts.json to mark as submitted
    try {
      const postsPath = path.join(__dirname, 'public', 'posts.json');
      const postsData = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));
      const index = postsData.findIndex(p => p.image_url === req.body.image_url);

      if (index !== -1) {
        postsData[index].status = 'submitted';
        postsData[index].submitted_at = new Date().toISOString();
        const updatedContent = JSON.stringify(postsData, null, 2);
        fs.writeFileSync(postsPath, updatedContent);
        console.log("✅ posts.json updated locally");
      }
    } catch (updateErr) {
      console.warn("⚠️ Failed to update posts.json:", updateErr.message);
    }

    res.status(200).json({ 
      status: 'ok', 
      zapier_response: zapierText,
      message: 'Successfully submitted to Zapier'
    });
  } catch (error) {
    console.error('❌ Submit Error:', error.message);
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

// Legacy submit endpoint for backward compatibility
app.post('/submit', async (req, res) => {
  // Redirect to new endpoint
  req.url = '/api/submit';
  return app._router.handle(req, res);
});

// Delete post endpoint
app.post('/api/delete-post', async (req, res) => {
  try {
    const { token_id } = req.body;
    
    if (!token_id) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'token_id is required' 
      });
    }

    console.log('🗑️ Deleting post with token_id:', token_id);
    
    // Read current posts.json
    const postsPath = path.join(__dirname, 'public', 'posts.json');
    const postsData = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));
    
    // Find and remove the post
    const postIndex = postsData.findIndex(p => p.token_id === token_id);
    if (postIndex === -1) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Post not found' 
      });
    }
    
    const deletedPost = postsData[postIndex];
    postsData.splice(postIndex, 1);
    
    // Update local posts.json
    const updatedContent = JSON.stringify(postsData, null, 2);
    fs.writeFileSync(postsPath, updatedContent);
    console.log('✅ Local posts.json updated');
    
    // Update GitHub posts.json
    if (GH_TOKEN) {
      try {
        const githubPath = 'public/posts.json';
        const commitMessage = `🗑️ Delete post ${deletedPost.image_url.split('/').pop()}`;
        
        const response = await fetch(`https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${githubPath}`, {
          method: 'PUT',
          headers: {
            'Authorization': `token ${GH_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: commitMessage,
            content: Buffer.from(updatedContent).toString('base64'),
            sha: await getFileSHA(githubPath)
          })
        });
        
        if (response.ok) {
          console.log('✅ GitHub posts.json updated');
        } else {
          console.warn('⚠️ Failed to update GitHub posts.json:', response.statusText);
        }
      } catch (githubError) {
        console.warn('⚠️ GitHub update failed:', githubError.message);
      }
    }
    
    res.status(200).json({ 
      status: 'ok', 
      message: 'Post deleted successfully',
      deleted_post: deletedPost
    });
    
  } catch (error) {
    console.error('❌ Delete Post Error:', error.message);
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

// Helper function to get file SHA for GitHub API
async function getFileSHA(filePath) {
  try {
    const response = await fetch(`https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${filePath}`, {
      headers: {
        'Authorization': `token ${GH_TOKEN}`,
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.sha;
    }
  } catch (error) {
    console.warn('Failed to get file SHA:', error.message);
  }
  return null;
}

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from public directory with appropriate caching
app.use(express.static(path.join(__dirname, 'public'), { 
  maxAge: process.env.NODE_ENV === 'production' ? '1h' : '0',
  etag: true,
  lastModified: true
}));

// Add cache-busting headers for frequently changing files
app.use('/app.js', (req, res, next) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

app.use('/js/modal.js', (req, res, next) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

app.use('/posts.json', (req, res, next) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// SPA fallback - serve index.html for all other routes
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Tribe SPA server listening on port 3000');
  console.log('📊 Health check: http://localhost:3000/healthz');
  console.log('🌐 GitHub proxy: http://localhost:3000/api/git/posts');
  console.log('🔑 GitHub token: Not configured (using mock data)');
  console.log('Server ready and running');
});
