import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;
const GH_PAT = process.env.GH_PAT;
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

// === Submit to Zapier & push update to GitHub ===
app.post('/submit', async (req, res) => {
  try {
    console.log("📤 Submitting to Zapier...");
    const zapierRes = await fetch('https://hooks.zapier.com/hooks/catch/17370933/2p0k85d/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const zapierText = await zapierRes.text();
    console.log("✅ Zapier submission complete");

    console.log("🛠 Updating posts.json...");
    const postsPath = path.resolve('./public/posts.json');
    const postsData = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));
    const index = postsData.findIndex(p => p.image_url === req.body.image_url);

    if (index !== -1) {
      postsData[index].status = 'hidden';
      const updatedContent = JSON.stringify(postsData, null, 2);
      fs.writeFileSync(postsPath, updatedContent);
      console.log("✅ posts.json updated locally");

      console.log("📦 Pushing update to GitHub...");
      await commitToGitHubFile(POSTS_JSON_PATH, updatedContent, `🚫 Hide post ${req.body.image_url}`);
      console.log("✅ GitHub commit successful");
    } else {
      throw new Error(`❌ Post not found in posts.json for image_url: ${req.body.image_url}`);
    }

    res.status(200).json({ status: 'ok', zapier_response: zapierText });
  } catch (error) {
    console.error('❌ Submit Error:', error.message);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// === GitHub Commit Utility ===
async function commitToGitHubFile(filepath, content, message) {
  const getUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filepath}`;
  const getRes = await fetch(getUrl, {
    headers: { Authorization: `token ${GH_PAT}` }
  });

  if (!getRes.ok) {
    const errorText = await getRes.text();
    throw new Error(`Failed to fetch file info: ${getRes.statusText} — ${errorText}`);
  }

  const getData = await getRes.json();

  const updateRes = await fetch(getUrl, {
    method: 'PUT',
    headers: {
      Authorization: `token ${GH_PAT}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      content: Buffer.from(content).toString('base64'),
      sha: getData.sha,
      branch: 'main'
    })
  });

  if (!updateRes.ok) {
    const errorBody = await updateRes.text();
    throw new Error(`GitHub API error: ${updateRes.statusText} — ${errorBody}`);
  }
}

// === OpenAI Assistant ===
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

  const threadData = await threadRes.json();
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

  const runRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2'
    },
    body: JSON.stringify({ assistant_id: ASSISTANT_ID })
  });

  const runData = await runRes.json();
  const runId = runData.id;

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
      const messagesData = await messagesRes.json();
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
