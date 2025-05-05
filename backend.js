import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import fs from "fs";
import { Octokit } from "@octokit/rest";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;
const GH_PAT = process.env.GH_PAT;

const octokit = new Octokit({ auth: GH_PAT });
const GITHUB_OWNER = 'WELCOMETOTHETRIBE';
const GITHUB_REPO = 'auto_post_dashboard';
const POSTS_JSON_PATH = 'public/posts.json';

app.use(express.json());
app.use(express.static('public'));

// === Caption Generation ===
app.post('/api/generate-caption', async (req, res) => {
  try {
    const caption = await runAssistant(req.body.prompt || "Generate a caption.");
    res.json({ caption });
  } catch (error) {
    console.error('Caption Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// === Hashtag Generation ===
app.post('/api/generate-hashtags', async (req, res) => {
  try {
    const hashtags = await runAssistant(`Generate relevant, concise, viral hashtags for this caption: ${req.body.caption}`);
    res.json({ hashtags });
  } catch (error) {
    console.error('Hashtag Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// === Submit post to Zapier and hide it ===
app.post('/submit', async (req, res) => {
  try {
    // 1. Submit to Zapier
    const zapierRes = await fetch('https://hooks.zapier.com/hooks/catch/17370933/2p0k85d/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const zapierText = await zapierRes.text();

    // 2. Update local posts.json
    const postsPath = './public/posts.json';
    const postsData = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));
    const index = postsData.findIndex(p => p.image_url === req.body.image_url);
    if (index !== -1) {
      postsData[index].status = 'hidden';
    } else {
      throw new Error(`Post not found in posts.json for image_url: ${req.body.image_url}`);
    }
    fs.writeFileSync(postsPath, JSON.stringify(postsData, null, 2));

    // 3. Push updated file to GitHub
    const { data: file } = await octokit.repos.getContent({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: POSTS_JSON_PATH
    });

    await octokit.repos.createOrUpdateFileContents({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: POSTS_JSON_PATH,
      message: `Hide submitted post for ${req.body.image_url}`,
      content: Buffer.from(JSON.stringify(postsData, null, 2)).toString('base64'),
      sha: file.sha,
      committer: {
        name: "Auto Poster",
        email: "auto@poster.com"
      },
      author: {
        name: "Auto Poster",
        email: "auto@poster.com"
      }
    });

    console.log(`✅ Post hidden and pushed to GitHub: ${req.body.image_url}`);
    res.status(200).json({ status: 'ok', zapier_response: zapierText });

  } catch (error) {
    console.error('❌ Submit/Post Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// === Shared function to run OpenAI Assistant ===
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
  const runId = runData.id;

  let output = "";
  let attempts = 0;
  let completed = false;

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
      const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2'
        }
      });
      const messagesData = await messagesResponse.json();
      const assistantReply = messagesData.data?.find(msg => msg.role === 'assistant');
      output = assistantReply?.content?.[0]?.text?.value || "No response generated.";
      completed = true;
    }

    attempts++;
  }

  if (!completed) throw new Error("Assistant did not complete in time");
  return output;
}

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
