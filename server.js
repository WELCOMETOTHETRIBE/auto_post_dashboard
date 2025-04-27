import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;

app.use(express.json());
app.use(express.static('public'));

app.post('/api/generate-caption', async (req, res) => {
  try {
    const userMessage = req.body.prompt || "Generate a caption.";

    // Step 1: Create a new Thread
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

    if (!threadData.id) {
      console.error('Error creating thread:', threadData);
      return res.status(500).json({ error: 'Failed to create thread' });
    }

    const threadId = threadData.id;

    // Step 2: Post user message into the thread
    await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        role: "user",
        content: userMessage
      })
    });

    // Step 3: Run the assistant
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        assistant_id: ASSISTANT_ID
      })
    });

    const runData = await runResponse.json();

    if (!runData.id) {
      console.error('Error starting run:', runData);
      return res.status(500).json({ error: 'Failed to start run' });
    }

    const runId = runData.id;

    // Step 4: Poll for run status
    let completed = false;
    let attempts = 0;
    let output = '';

    while (!completed && attempts < 10) {
      await new Promise(resolve => setTimeout(resolve, 1500)); // wait 1.5 seconds

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

    if (!completed) {
      return res.status(500).json({ error: 'Assistant did not complete in time.' });
    }

    res.json({ caption: output });
  } catch (error) {
    console.error('Assistant API Error:', error);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
