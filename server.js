import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { runTriggerScript } from "./triggerScript.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

// === Forward to Zapier ===
app.post('/submit', async (req, res) => {
  try {
    const zapierRes = await fetch('https://hooks.zapier.com/hooks/catch/17370933/2p0k85d/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    const data = await zapierRes.text();
    res.status(200).json({ status: 'ok', zapier_response: data });
  } catch (error) {
    console.error('Zapier Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// === Mark Post as Hidden ===
app.post('/api/mark-hidden', (req, res) => {
  const { image_url } = req.body;
  const postsPath = path.join(__dirname, 'posts.json');

  try {
    const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
    const updatedPosts = posts.map(post =>
      post.image_url === image_url ? { ...post, status: 'hidden' } : post
    );

    fs.writeFileSync(postsPath, JSON.stringify(updatedPosts, null, 2));
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating post status:', error);
    res.status(500).json({ error: 'Failed to update post status.' });
  }
});

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
