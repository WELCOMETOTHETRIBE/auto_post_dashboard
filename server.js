import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// === API: Generate Caption ===
app.post('/api/generate-caption', async (req, res) => {
  try {
    const prompt = `You are a caption generator for FruTropics. Return only one engaging caption for this image description, no hashtags, no follow-up: ${req.body.prompt}`;
    const caption = await runAssistant(prompt);
    res.json({ caption });
  } catch (err) {
    console.error('Caption Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// === API: Generate Hashtags ===
app.post('/api/generate-hashtags', async (req, res) => {
  try {
    const prompt = `Generate relevant, concise, and viral hashtags for the following caption. Only return hashtags and nothing else: ${req.body.caption}`;
    const hashtags = await runAssistant(prompt);
    res.json({ hashtags });
  } catch (err) {
    console.error('Hashtag Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// === Submit to Zapier ===
app.post('/submit', async (req, res) => {
  try {
    const zapierRes = await fetch('https://hooks.zapier.com/hooks/catch/17370933/2p0k85d/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await zapierRes.text();
    res.status(200).json({ status: 'ok', zapier_response: data });
  } catch (err) {
    console.error('Zapier Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// === OpenAI Assistant Runner ===
async function runAssistant(userMessage) {
  const threadRes = await fetch('https://api.openai.com/v1/threads', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2'
    },
    body: JSON.stringify({})
  });

  const { id: threadId } = await threadRes.json();
  if (!threadId) throw new Error('Failed to create thread');

  await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2'
    },
    body: JSON.stringify({ role: 'user', content: userMessage })
  });

  const runRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2'
    },
    body: JSON.stringify({ assistant_id: ASSISTANT_ID })
  });

  const { id: runId } = await runRes.json();
  if (!runId) throw new Error('Failed to start run');

  let completed = false;
  let output = '';
  for (let attempts = 0; attempts < 10; attempts++) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const statusRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      }
    });
    const status = await statusRes.json();

    if (status.status === 'completed') {
      const messagesRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2'
        }
      });
      const messages = await messagesRes.json();
      const message = messages.data.find(msg => msg.role === 'assistant');
      output = message?.content?.[0]?.text?.value || 'No response.';
      completed = true;
      break;
    }
  }

  if (!completed) throw new Error('Assistant did not complete in time');
  return output;
}

// Serve static public folder (dashboard, index.html)
app.use(express.static(path.join(__dirname, 'public')));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
