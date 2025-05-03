// server_trigger.js
import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 9001;

const FRONTEND_ORIGIN = 'https://autopostdashboard-production.up.railway.app';

app.use(cors({
  origin: FRONTEND_ORIGIN,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Handle preflight CORS requests
app.options('/trigger-upload', cors({
  origin: FRONTEND_ORIGIN,
  methods: ['POST'],
  allowedHeaders: ['Content-Type']
}));

// Required for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Trigger Route
app.post('/trigger-upload', (req, res) => {
  const SCRIPT_PATH = "/Users/patrick/Desktop/Desktop/auto_post/scripts/auto.sh";
  console.log('🧭 Resolved script path:', SCRIPT_PATH);

  exec(`bash "${SCRIPT_PATH}"`, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Script execution error:', error);
      return res.status(500).json({ status: 'error', message: error.message });
    }
    if (stderr) console.warn('⚠️ Script stderr:', stderr);
    console.log('✅ Script output:', stdout);
    res.status(200).json({ status: 'success', output: stdout });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Trigger server running at http://localhost:${PORT}`);
});
