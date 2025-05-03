// server_trigger.js
import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 9001;

// ✅ Enable CORS for the deployed frontend
app.use(cors({
  origin: 'https://autopostdashboard-production.up.railway.app'
}));

app.use(express.json());

// Required for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === SCRIPT TRIGGER ROUTE ===
app.post('/trigger-upload', (req, res) => {
  const SCRIPT_PATH = "/Users/patrick/Desktop/Desktop/auto_post/scripts/auto.sh";
  console.log('🧭 Resolved script path:', SCRIPT_PATH);

  exec(`bash "${SCRIPT_PATH}"`, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Script execution error:', error);
      return res.status(500).json({ status: 'error', message: error.message });
    }
    if (stderr) {
      console.warn('⚠️ Script stderr:', stderr);
    }
    console.log('✅ Script output:', stdout);
    res.status(200).json({ status: 'success', output: stdout });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Trigger server running at http://localhost:${PORT}`);
});
