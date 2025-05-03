// app.js (Node-style version)
const express = require("express");
const dotenv = require("dotenv");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// === Caption Generation ===
app.post("/api/generate-caption", async (req, res) => {
  try {
    const userMessage = req.body.prompt || "Generate a caption.";

    const threadRes = await fetch("https://api.openai.com/v1/threads", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "assistants=v2",
      },
      body: JSON.stringify({}),
    });

    const threadData = await threadRes.json();
    const threadId = threadData.id;

    await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "assistants=v2",
      },
      body: JSON.stringify({ role: "user", content: userMessage }),
    });

    const runRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "assistants=v2",
      },
      body: JSON.stringify({ assistant_id: ASSISTANT_ID }),
    });

    const runId = runRes.id;
    let output = "";
    let completed = false;
    let attempts = 0;

    while (!completed && attempts < 10) {
      await new Promise((r) => setTimeout(r, 1500));
      const statusRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
          "OpenAI-Beta": "assistants=v2",
        },
      });

      const statusData = await statusRes.json();
      if (statusData.status === "completed") {
        completed = true;
        const messagesRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
            "OpenAI-Beta": "assistants=v2",
          },
        });

        const messagesData = await messagesRes.json();
        const latest = messagesData.data.find((msg) => msg.role === "assistant");
        output = latest?.content?.[0]?.text?.value || "No response.";
      }
      attempts++;
    }

    res.json({ caption: output });
  } catch (err) {
    console.error("Caption Error:", err);
    res.status(500).json({ error: "Caption generation failed" });
  }
});

// === Zapier Hook ===
app.post("/submit", async (req, res) => {
  try {
    const zapRes = await fetch("https://hooks.zapier.com/hooks/catch/17370933/2p0k85d/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await zapRes.text();
    res.status(200).json({ status: "ok", zapier_response: data });
  } catch (err) {
    console.error("Zapier Error:", err);
    res.status(500).json({ error: "Failed to send to Zapier" });
  }
});

// === Start Server ===
app.listen(PORT, () => {
  console.log(`🚀 Running at http://localhost:${PORT}`);
});
