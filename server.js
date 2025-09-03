import express from 'express';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// GitHub configuration
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

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1h' }));

// SPA fallback - serve index.html for all other routes
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Tribe SPA server listening on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/healthz`);
  console.log(`🌐 GitHub proxy: http://localhost:${PORT}/api/git/posts`);
  console.log(`🔑 GitHub token: ${GH_TOKEN ? 'Configured' : 'Not configured (using mock data)'}`);
});
