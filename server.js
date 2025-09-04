// FORCE DEPLOYMENT: 2025-09-03 23:31 UTC - Railway deployment switch
// NUCLEAR FORCE UPDATE: 2025-09-03 23:57 UTC - Massive change to force code update
import express from 'express';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

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
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;
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
    if (!OPENAI_API_KEY || !ASSISTANT_ID) {
      return res.status(500).json({ error: 'OpenAI not configured' });
    }
    const caption = await runAssistant(req.body.prompt || "Generate a caption.");
    res.json({ caption });
  } catch (error) {
    console.error('Caption Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Hashtag Generation
app.post('/api/generate-hashtags', async (req, res) => {
  try {
    if (!OPENAI_API_KEY || !ASSISTANT_ID) {
      return res.status(500).json({ error: 'OpenAI not configured' });
    }
    const hashtags = await runAssistant(`Generate relevant, concise, viral hashtags for this caption: ${req.body.caption}`);
    res.json({ hashtags });
  } catch (error) {
    console.error('Hashtag Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Image Analysis
app.post('/api/interpret-image', async (req, res) => {
  try {
    if (!OPENAI_API_KEY || !ASSISTANT_ID) {
      return res.status(500).json({ error: 'OpenAI not configured' });
    }
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
async function runAssistant(userMessage) {
  try {
    const threadRes = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({})
    });

    if (!threadRes.ok) {
      throw new Error(`Failed to create thread: ${threadRes.statusText}`);
    }

    const threadData = await threadRes.json();
    const threadId = threadData.id;

    // Add user message
    await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({ role: "user", content: userMessage })
    });

    // Run assistant
    const runRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({ assistant_id: ASSISTANT_ID })
    });

    if (!runRes.ok) {
      throw new Error(`Failed to run assistant: ${runRes.statusText}`);
    }

    const runData = await runRes.json();
    const runId = runData.id;

    // Wait for completion
    let output = "";
    let attempts = 0;
    let completed = false;

    while (!completed && attempts < 10) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const statusRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2'
        }
      });
      
      if (!statusRes.ok) {
        throw new Error(`Failed to check run status: ${statusRes.statusText}`);
      }
      
      const statusData = await statusRes.json();

      if (statusData.status === 'completed') {
        const messagesRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
            'OpenAI-Beta': 'assistants=v2'
          }
        });
        
        if (!messagesRes.ok) {
          throw new Error(`Failed to get messages: ${messagesRes.statusText}`);
        }
        
        const messagesData = await messagesRes.json();
        const assistantReply = messagesData.data?.find(msg => msg.role === 'assistant');
        output = assistantReply?.content?.[0]?.text?.value || "No response generated.";
        completed = true;
      } else if (statusData.status === 'failed') {
        throw new Error(`Assistant run failed: ${statusData.last_error?.message || 'Unknown error'}`);
      }

      attempts++;
    }

    if (!completed) {
      throw new Error("Assistant did not complete in time");
    }
    
    return output;
  } catch (error) {
    console.error('OpenAI Assistant Error:', error);
    throw error;
  }
}

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

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1h' }));

// SPA fallback - serve index.html for all other routes
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('🚀🚀🚀 NUCLEAR UPDATE: Tribe SPA server listening on port 3000 🚀🚀🚀');
  console.log('📊 Health check: http://localhost:3000/healthz');
  console.log('🌐 GitHub proxy: http://localhost:3000/api/git/posts');
  console.log('🔑 GitHub token: Not configured (using mock data)');
  console.log('✅✅✅ THIS IS THE NEW CODE RUNNING! ✅✅✅');
});
