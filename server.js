import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 5500;

// To handle __dirname properly (ES Module workaround)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());

// Serve static files (your dashboard) from /public
app.use(express.static(path.join(__dirname, "public")));

// Serve OpenAI API Key securely
app.get("/api/key", (req, res) => {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return res.status(500).json({ error: "OpenAI API Key not set." });
  }
  res.json({ key: openaiKey });
});

// Default route (optional)
app.get("/", (req, res) => {
  res.send("🚀 Welcome to your Auto Post Dashboard Server!");
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT || 3000;

// Needed because we're using ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all to send index.html for any unknown routes (like SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
