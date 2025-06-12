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
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
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
      const ext = mime.extension(file.mimetype);
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

async function commitToGitHubFile(filepath, content, message) {
  const getUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filepath}`;
  const headers = {
    Authorization: `token ${GH_PAT}`,
    'Content-Type': 'application/json'
  };

  const getRes = await fetch(getUrl, { headers });

  let sha = undefined;
  if (getRes.status === 200) {
    const getData = await getRes.json();
    sha = getData.sha;
  } else if (getRes.status !== 404) {
    const errorText = await getRes.text();
    throw new Error(`Failed to fetch file info: ${getRes.statusText} — ${errorText}`);
  }

  const body = {
    message,
    content: Buffer.from(content).toString('base64'),
    branch: 'main',
    ...(sha && { sha })
  };

  const updateRes = await fetch(getUrl, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body)
  });

  if (!updateRes.ok) {
    const errorBody = await updateRes.text();
    throw new Error(`GitHub API error: ${updateRes.statusText} — ${errorBody}`);
  }
}

// === OpenAI Assistant Runner ===
async function runAssistant(userMessage) {
  const threadResponse = await fetch('https://api.openai.com/v1/threads', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2'
    },
    body: JSON.stringify({})
  });

  const threadData = await threadResponse.json();
  if (!threadData.id) throw new Error("Failed to create thread");

  const threadId = threadData.id;

  await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2'
    },
    body: JSON.stringify({ role: "user", content: userMessage })
  });

  const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2'
    },
    body: JSON.stringify({ assistant_id: ASSISTANT_ID })
  });

  const runData = await runResponse.json();
  if (!runData.id) throw new Error("Failed to start run");

  const runId = runData.id;
  let attempts = 0;
  let completed = false;
  let output = "";

  while (!completed && attempts < 10) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const statusResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      }
    });
    const statusData = await statusResponse.json();

    if (statusData.status === 'completed') {
      completed = true;
      const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2'
        }
      });
      const messagesData = await messagesResponse.json();
      const messages = messagesData.data || [];
      const latestMessage = messages.find(msg => msg.role === 'assistant');
      output = latestMessage?.content?.[0]?.text?.value || "No response generated.";
    }
    attempts++;
  }

  if (!completed) throw new Error("Assistant did not complete in time");
  return output;
}

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
