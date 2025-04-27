import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;

app.use(express.json());
app.use(express.static('public'));

app.post('/api/generate-caption', async (req, res) => {
  const { keywords } = req.body;

  try {
    // 1. Create a new thread
    const threadRes = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const threadData = await threadRes.json();
    const threadId = threadData.id;

    if (!threadId) {
      throw new Error('Failed to create thread');
    }

    // 2. Post a message to the thread
    await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        role: "user",
        content: `Create an Instagram-style caption using these keywords: ${keywords}`
      })
    });

    // 3. Run the Assistant on the thread
    const runRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        assistant_id: ASSISTANT_ID
      })
    });

    const runData = await runRes.json();
    const runId = runData.id;

    if (!runId) {
      throw new Error('Failed to create run');
    }

    // 4. Poll for the run to complete
    let status = 'in_progress';
    let runResult;

    while (status === 'in_progress' || status === 'queued') {
      await new Promise(resolve => setTimeout(resolve, 1500)); // wait 1.5 sec
      const checkRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      runResult = await checkRes.json();
      status = runResult.status;
    }

    // 5. Get the latest message (assistant's reply)
    const messagesRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const messagesData = await messagesRes.json();
    const messages = messagesData.data;
    const assistantReply = messages.find(m => m.role === 'assistant');

    const caption = assistantReply ? assistantReply.content[0].text.value : 'Caption not generated.';

    res.json({ caption });

  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
