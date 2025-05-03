import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static('public'));

// === Shared: Run Assistant ===
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

// === Caption Generation ===
app.post('/api/generate-caption', async (req, res) => {
  try {
    const prompt = req.body.prompt || "Generate a caption.";
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
    const caption = req.body.caption || "Generate hashtags.";
    const hashtags = await runAssistant(`Generate relevant, concise, viral hashtags for this caption: ${caption}`);
    res.json({ hashtags });
  } catch (error) {
    console.error('Hashtag Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// === Submit to Zapier + Move to drafts.json ===
app.post('/submit', async (req, res) => {
  try {
    const payload = req.body;

    // Forward to Zapier
    const zapierRes = await fetch('https://hooks.zapier.com/hooks/catch/17370933/2p0k85d/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const zapierResponse = await zapierRes.text();

    // === Move to drafts.json ===
    const postsPath = path.join(__dirname, 'public', 'posts.json');
    const draftsPath = path.join(__dirname, 'public', 'drafts.json');

    const posts = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));
    const drafts = fs.existsSync(draftsPath) ? JSON.parse(fs.readFileSync(draftsPath, 'utf-8')) : [];

    const filteredPosts = posts.filter(post => post.image_url !== payload.image_url);
    drafts.push(payload);

    fs.writeFileSync(postsPath, JSON.stringify(filteredPosts, null, 2));
    fs.writeFileSync(draftsPath, JSON.stringify(drafts, null, 2));

    res.status(200).json({ status: 'ok', zapier_response: zapierResponse });
  } catch (error) {
    console.error('Submit Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
