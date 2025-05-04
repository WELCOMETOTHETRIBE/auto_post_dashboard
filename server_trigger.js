// server_trigger.js
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { runTriggerScript } from './triggerScript.js';

const app = express();
const PORT = process.env.PORT || 9001;

// ✅ Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, 'public');

// ✅ CORS config
app.use(cors({
  origin: 'https://autopostdashboard-production.up.railway.app',
  optionsSuccessStatus: 200
}));

app.use(express.json());

// ✅ Static frontend
app.use(express.static(PUBLIC_DIR));

// === HEALTH CHECK ===
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// === TRIGGER ROUTE ===
app.post('/trigger-upload', async (req, res) => {
  try {
    const result = await runTriggerScript();
    res.status(200).json({ status: 'success', result });
  } catch (error) {
    console.error('❌ Script execution error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ✅ Fallback: serve index.html (handles unknown paths for SPA)
app.get('*', async (req, res) => {
  try {
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
  } catch (err) {
    res.status(500).send('⚠️ Could not serve index.html');
  }
});

// === SERVER START ===
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Trigger server running on port ${PORT}`);
});
