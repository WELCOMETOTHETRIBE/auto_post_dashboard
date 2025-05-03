// app.js
import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;

app.use(express.json());
app.use(express.static("public"));

// === Caption Generation via OpenAI Assistant ===
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
    if (!threadData.id) return res.status(500).json({ error: "Thread creation failed" });
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

    const runData = await runRes.json();
    const runId = runData.id;
    let completed = false, attempts = 0, output = "";

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
        output = latest?.content?.[0]?.text?.value || "No response generated.";
      }
      attempts++;
    }

    if (!completed) return res.status(500).json({ error: "Assistant timeout" });
    res.json({ caption: output });
  } catch (err) {
    console.error("Caption Error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// === Zapier Webhook Submission ===
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
    res.status(500).json({ status: "error", message: err.message });
  }
});

// === Draft Migration Endpoint ===
app.post("/update-jsons", async (req, res) => {
  const { image_url, caption, hashtags, platform, publish_now } = req.body;

  try {
    const posts = JSON.parse(fs.readFileSync("posts.json", "utf8"));
    const drafts = fs.existsSync("drafts.json")
      ? JSON.parse(fs.readFileSync("drafts.json", "utf8"))
      : [];

    const filteredPosts = posts.filter((post) => post.image_url !== image_url);
    const newDraft = { image_url, caption, hashtags, platform, publish_now };
    drafts.push(newDraft);

    fs.writeFileSync("posts.json", JSON.stringify(filteredPosts, null, 2));
    fs.writeFileSync("drafts.json", JSON.stringify(drafts, null, 2));

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Update JSON Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// === Start Server ===
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
