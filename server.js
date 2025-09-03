import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import path from "path";
import fs from "fs";
import multer from "multer";
import mime from "mime-types";
import { fileURLToPath } from "url";
import { runTriggerScript } from "./triggerScript.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;
const GH_PAT = process.env.GH_PAT;
const GITHUB_OWNER = 'WELCOMETOTHETRIBE';
const GITHUB_REPO = 'auto_post_dashboard';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const upload = multer({ dest: '/tmp' });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', express.static('public'));

// Health check endpoint for Docker
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: 'v2.1.0-nuclear',
    deployment: '2025-09-02T09:52:00Z',
    services: {
      openai: !!OPENAI_API_KEY,
      assistant: !!ASSISTANT_ID,
      github: !!GH_PAT
    }
  });
});

// Deployment version endpoint
app.get('/api/version', (req, res) => {
  res.json({
    version: 'v2.1.0-nuclear',
    deployment: '2025-09-02T09:52:00Z',
    timestamp: new Date().toISOString(),
    git_commit: process.env.GIT_COMMIT || 'unknown',
    environment: process.env.NODE_ENV || 'production'
  });
});

// AI service health check
app.get('/api/ai-health', async (req, res) => {
  try {
    if (!OPENAI_API_KEY || !ASSISTANT_ID) {
      return res.status(503).json({ 
        status: 'unavailable',
        error: 'AI service not configured',
        openai_key: !!OPENAI_API_KEY,
        assistant_id: !!ASSISTANT_ID
      });
    }

    // Test OpenAI API connection
    const testResponse = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      }
    });

    if (!testResponse.ok) {
      return res.status(503).json({ 
        status: 'unavailable',
        error: 'OpenAI API connection failed',
        status_code: testResponse.status
      });
    }

    res.status(200).json({ 
      status: 'available',
      timestamp: new Date().toISOString(),
      openai_key: !!OPENAI_API_KEY,
      assistant_id: !!ASSISTANT_ID
    });
  } catch (error) {
    console.error('AI health check error:', error);
    res.status(503).json({ 
      status: 'unavailable',
      error: error.message
    });
  }
});

// Test AI assistant response
app.post('/api/test-ai', async (req, res) => {
  try {
    const { test_prompt } = req.body;
    
    if (!test_prompt) {
      return res.status(400).json({ error: 'Test prompt is required' });
    }

    if (!OPENAI_API_KEY || !ASSISTANT_ID) {
      return res.status(503).json({ error: 'AI service not configured' });
    }

    console.log('Testing AI with prompt:', test_prompt);
    const response = await runAssistant(test_prompt);
    console.log('AI test response:', response);
    
    res.json({ 
      success: true,
      response: response,
      prompt: test_prompt
    });
  } catch (error) {
    console.error('AI test error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      prompt: req.body.test_prompt
    });
  }
});

// Redirect root to main app (no more auth)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// === Trigger Upload Endpoint ===
app.post('/trigger-upload', async (req, res) => {
  try {
    const result = await runTriggerScript();
    res.status(200).json({ message: result });
  } catch (err) {
    console.error('Trigger Script Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// === Upload Image/Video ===
app.post('/upload-image', upload.array('image', 10), async (req, res) => {
  try {
    const files = req.files;
    const brand = req.body.brand;
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    if (!brand) {
      return res.status(400).json({ error: 'Brand selection is required' });
    }

    const imageUrls = [];
    const postsPath = path.resolve('./public/posts.json');
    let posts = [];
    try {
      posts = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));
    } catch (e) {
      console.warn("posts.json not found or invalid. Creating a new one.");
    }

    for (const file of files) {
      let ext = mime.extension(file.mimetype);
      if (ext === 'qt') ext = 'mov';
      const newFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const githubPath = `archive/${newFileName}`;
      const imageUrl = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/${githubPath}`;

      const imageBuffer = fs.readFileSync(file.path);
      await commitToGitHubFile(githubPath, imageBuffer, `📤 Uploaded media ${newFileName}`);

      posts.push({
        image_url: imageUrl,
        caption: '',
        hashtags: '',
        platform: '',
        status: 'visible',
        product: '',
        brand: brand,
        token_id: `token_${Math.random().toString(36).substring(2, 10)}`
      });

      imageUrls.push(imageUrl);
    }

    fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2));
    await commitToGitHubFile('public/posts.json', JSON.stringify(posts, null, 2), `➕ Add post(s) for uploaded media`);

    res.json({ image_urls: imageUrls });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).send('Upload failed');
  }
});

// === Caption Generation ===
app.post('/api/generate-caption', async (req, res) => {
  try {
    const prompt = `You are a caption generator for FruTropics. Return only one engaging caption for this image description, no hashtags, no follow-up: ${req.body.prompt}`;
    const caption = await runAssistant(prompt);
    res.json({ caption });
  } catch (error) {
    console.error('Caption Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// === Hashtag Generation ===
app.post('/api/generate-hashtags', async (req, res) => {
  try {
    const prompt = `Generate relevant, concise, and viral hashtags for the following caption. Only return hashtags and nothing else: ${req.body.caption}`;
    const hashtags = await runAssistant(prompt);
    res.json({ hashtags });
  } catch (error) {
    console.error('Hashtag Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// === AI Image Interpretation ===
app.post('/api/interpret-image', async (req, res) => {
  try {
    const { image_url, brand, product } = req.body;
    
    if (!image_url) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    // Validate environment variables
    if (!OPENAI_API_KEY) {
      console.error('OpenAI API key not configured');
      return res.status(500).json({ error: 'AI service not configured. Please contact administrator.' });
    }

    if (!ASSISTANT_ID) {
      console.error('OpenAI Assistant ID not configured');
      return res.status(500).json({ error: 'AI assistant not configured. Please contact administrator.' });
    }

    console.log('Starting AI image interpretation for:', image_url, 'Brand:', brand, 'Product:', product);

    // Approach 1: Try to get context-based content generation
    let description = '';
    let caption = '';
    let hashtags = '';

    try {
      // Create a prompt for image interpretation
      const interpretationPrompt = `You are an expert social media content creator. I have an image for a social media post, and I need you to create engaging content based on the context.

Image Context: ${image_url}
Brand: ${brand || 'Not specified'}
Product: ${product || 'Not specified'}

Based on this context, please create:
1. A description of what this image likely contains (based on the brand/product context)
2. An engaging social media caption that would work well with this type of image
3. Relevant hashtags for this type of content

IMPORTANT: You must respond in this exact JSON format:
{
  "description": "Your description of what this image likely contains based on the context",
  "caption": "Your engaging social media caption",
  "hashtags": "hashtag1 hashtag2 hashtag3 hashtag4 hashtag5"
}

Make the content engaging, authentic, and suitable for social media. Consider the brand and product context to create relevant content.`;

      console.log('Attempting context-based content generation...');
      const interpretation = await runAssistant(interpretationPrompt);
      console.log('AI interpretation completed');
      console.log('Raw AI response:', interpretation);
      
      // Try to parse the JSON response
      try {
        const parsedResponse = JSON.parse(interpretation);
        console.log('Successfully parsed JSON response:', parsedResponse);
        description = parsedResponse.description || '';
        caption = parsedResponse.caption || '';
        hashtags = parsedResponse.hashtags || '';
      } catch (parseError) {
        console.log('JSON parsing failed, error:', parseError.message);
        console.log('Attempting to extract content from text response');
        
        // Extract content from text response
        const lines = interpretation.split('\n');
        
        for (const line of lines) {
          const lowerLine = line.toLowerCase().trim();
          if (lowerLine.includes('description:') || lowerLine.includes('what you see:') || lowerLine.includes('image shows:')) {
            description = line.split(':').slice(1).join(':').trim();
          } else if (lowerLine.includes('caption:') || lowerLine.includes('social media:') || lowerLine.includes('post:')) {
            caption = line.split(':').slice(1).join(':').trim();
          } else if (lowerLine.includes('hashtag') || line.includes('#')) {
            hashtags = line.replace(/^.*?:/, '').trim();
          }
        }
      }
    } catch (contextError) {
      console.log('Context-based generation failed:', contextError.message);
    }

    // Approach 2: Use existing endpoints as fallback
    if (!caption || caption.length < 20) {
      try {
        console.log('Using caption generation endpoint...');
        const captionRes = await fetch(`${req.protocol}://${req.get('host')}/api/generate-caption`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            prompt: `Create an engaging social media caption for a ${brand || 'brand'} image${product ? ` featuring ${product}` : ''}. Make it exciting and authentic.` 
          })
        });
        
        if (captionRes.ok) {
          const captionData = await captionRes.json();
          caption = captionData.caption || caption;
          console.log('Generated caption:', caption);
        }
      } catch (captionError) {
        console.log('Caption generation failed:', captionError.message);
      }
    }
    
    if (!hashtags || !hashtags.includes('#')) {
      try {
        console.log('Using hashtag generation endpoint...');
        const hashtagRes = await fetch(`${req.protocol}://${req.get('host')}/api/generate-hashtags`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            caption: caption || `A ${brand || 'brand'} social media post${product ? ` about ${product}` : ''}` 
          })
        });
        
        if (hashtagRes.ok) {
          const hashtagData = await hashtagRes.json();
          hashtags = hashtagData.hashtags || hashtags;
          console.log('Generated hashtags:', hashtags);
        }
      } catch (hashtagError) {
        console.log('Hashtag generation failed:', hashtagError.message);
      }
    }

    // Approach 3: Generate fallback content based on brand/product
    if (!description) {
      description = `A professional image for ${brand || 'our brand'}${product ? ` featuring ${product}` : ''}. The image appears to be high-quality and suitable for social media marketing.`;
    }
    
    if (!caption) {
      caption = `Discover amazing content from ${brand || 'our brand'}! ${product ? `Experience the quality of ${product}.` : 'Quality you can trust.'} #${brand || 'brand'} #quality #socialmedia`;
    }
    
    if (!hashtags) {
      hashtags = `#${brand || 'brand'} #socialmedia #content #quality #marketing`;
    }
    
    console.log('Final content:', { description, caption, hashtags });
    
    res.json({
      description: description || 'Image analysis completed',
      caption: caption || 'Engaging content for your audience!',
      hashtags: hashtags || '#content #socialmedia #engagement'
    });
    
  } catch (error) {
    console.error('Image interpretation error:', error);
    
    // Provide more specific error messages
    if (error.message.includes('API key')) {
      res.status(500).json({ error: 'AI service authentication failed. Please contact administrator.' });
    } else if (error.message.includes('timeout') || error.message.includes('did not complete')) {
      res.status(500).json({ error: 'AI analysis timed out. Please try again.' });
    } else if (error.message.includes('assistant')) {
      res.status(500).json({ error: 'AI assistant not available. Please try again later.' });
    } else {
      res.status(500).json({ error: 'Failed to interpret image. Please try again.' });
    }
  }
});

// === Submit & Update GitHub ===
app.post('/submit', async (req, res) => {
  try {
    const zapierRes = await fetch('https://hooks.zapier.com/hooks/catch/17370933/2p0k85d/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await zapierRes.text();

    const postsPath = path.resolve('./public/posts.json');
    const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
    const updatedPosts = posts.map(post =>
      post.image_url === req.body.image_url ? { ...post, status: 'hidden' } : post
    );
    fs.writeFileSync(postsPath, JSON.stringify(updatedPosts, null, 2));

    await commitToGitHubFile('public/posts.json', JSON.stringify(updatedPosts, null, 2), `🚫 Hide post ${req.body.image_url}`);

    res.status(200).json({ status: 'ok', zapier_response: data });
  } catch (error) {
    console.error('Submit Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

async function commitToGitHubFile(filepath, content, message, maxRetries = 3) {
  const getUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filepath}`;
  const headers = {
    Authorization: `token ${GH_PAT}`,
    'Content-Type': 'application/json'
  };

  let attempt = 0;

  while (attempt < maxRetries) {
    // Always fetch the latest SHA before each attempt
    let sha = undefined;
    const getRes = await fetch(getUrl, { headers });

    if (getRes.status === 200) {
      const getData = await getRes.json();
      sha = getData.sha;
    } else if (getRes.status !== 404) {
      const errorText = await getRes.text();
      throw new Error(`Failed to fetch file info: ${getRes.statusText} — ${errorText}`);
    }

    const body = {
      message,
      content: Buffer.isBuffer(content) ? content.toString('base64') : Buffer.from(content).toString('base64'),
      branch: 'main',
      ...(sha && { sha })
    };

    const updateRes = await fetch(getUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body)
    });

    if (updateRes.ok) {
      // Success!
      return;
    } else if (updateRes.status === 409) {
      // Conflict: refetch and retry
      attempt++;
      if (attempt >= maxRetries) {
        const errorBody = await updateRes.text();
        throw new Error(`GitHub API error: Conflict after ${maxRetries} attempts — ${errorBody}`);
      }
      continue;
    } else {
      const errorBody = await updateRes.text();
      throw new Error(`GitHub API error: ${updateRes.statusText} — ${errorBody}`);
    }
  }
  throw new Error('Failed to update file on GitHub after multiple attempts due to repeated conflicts.');
}
// === OpenAI Assistant Runner ===
async function runAssistant(userMessage) {
  try {
    // Validate inputs
    if (!userMessage || typeof userMessage !== 'string') {
      throw new Error('Invalid message provided to assistant');
    }

    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    if (!ASSISTANT_ID) {
      throw new Error('OpenAI Assistant ID not configured');
    }

    console.log('Creating OpenAI thread...');
    const threadResponse = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({})
    });

    if (!threadResponse.ok) {
      const errorText = await threadResponse.text();
      throw new Error(`Failed to create thread: ${threadResponse.status} - ${errorText}`);
    }

    const threadData = await threadResponse.json();
    if (!threadData.id) {
      throw new Error("Failed to create thread - no thread ID returned");
    }

    const threadId = threadData.id;
    console.log('Thread created:', threadId);

    // Add message to thread
    console.log('Adding message to thread...');
    const messageResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({ role: "user", content: userMessage })
    });

    if (!messageResponse.ok) {
      const errorText = await messageResponse.text();
      throw new Error(`Failed to add message: ${messageResponse.status} - ${errorText}`);
    }

    // Start run
    console.log('Starting assistant run...');
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({ assistant_id: ASSISTANT_ID })
    });

    if (!runResponse.ok) {
      const errorText = await runResponse.text();
      throw new Error(`Failed to start run: ${runResponse.status} - ${errorText}`);
    }

    const runData = await runResponse.json();
    if (!runData.id) {
      throw new Error("Failed to start run - no run ID returned");
    }

    const runId = runData.id;
    console.log('Run started:', runId);

    // Poll for completion
    let attempts = 0;
    const maxAttempts = 20; // Increased timeout
    let completed = false;
    let output = "";

    while (!completed && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Increased delay
      attempts++;
      
      console.log(`Checking run status (attempt ${attempts}/${maxAttempts})...`);
      
      const statusResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2'
        }
      });

      if (!statusResponse.ok) {
        const errorText = await statusResponse.text();
        throw new Error(`Failed to check run status: ${statusResponse.status} - ${errorText}`);
      }

      const statusData = await statusResponse.json();
      console.log('Run status:', statusData.status);

      if (statusData.status === 'completed') {
        completed = true;
        console.log('Run completed, fetching messages...');
        
        const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
            'OpenAI-Beta': 'assistants=v2'
          }
        });

        if (!messagesResponse.ok) {
          const errorText = await messagesResponse.text();
          throw new Error(`Failed to fetch messages: ${messagesResponse.status} - ${errorText}`);
        }

        const messagesData = await messagesResponse.json();
        const messages = messagesData.data || [];
        const latestMessage = messages.find(msg => msg.role === 'assistant');
        output = latestMessage?.content?.[0]?.text?.value || "No response generated.";
        
        console.log('Assistant response received');
      } else if (statusData.status === 'failed') {
        throw new Error(`Assistant run failed: ${statusData.last_error?.message || 'Unknown error'}`);
      } else if (statusData.status === 'cancelled') {
        throw new Error('Assistant run was cancelled');
      } else if (statusData.status === 'expired') {
        throw new Error('Assistant run expired');
      }
    }

    if (!completed) {
      throw new Error(`Assistant did not complete in time (${maxAttempts * 2} seconds)`);
    }

    return output;
  } catch (error) {
    console.error('Assistant error:', error);
    throw error; // Re-throw to be handled by the calling function
  }
}

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
