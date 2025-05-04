// server_trigger.js
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { runTriggerScript } from './triggerScript.js';

const app = express();
const PORT = process.env.PORT || 9001;

// ✅ Required to resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, 'public');

// ✅ CORS configuration for your frontend
app.use(cors({
  origin: 'https://autopostdashboard-production.up.railway.app',
  optionsSuccessStatus: 200
}));

app.use(express.json());

// ✅ Serve static frontend files (index.html, style.css, posts.json, etc.)
app.use(express.static(PUBLIC_DIR));

// === SCRIPT TRIGGER ROUTE ===
app.post('/trigger-upload', async (req, res) => {
  try {
    const result = await runTriggerScript();
    res.status(200).json({ status: 'success', result });
  } catch (error) {
    console.error('❌ Script execution error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ✅ Fallback route to serve index.html for root or unknown GETs
app.get('*', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// === SERVER START ===
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Trigger server running on port ${PORT}`);
});
