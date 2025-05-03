// server_trigger.js
import express from 'express';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 9001;
app.use(express.json());

// Required for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === SCRIPT TRIGGER ROUTE ===
app.post('/trigger-upload', (req, res) => {
  const SCRIPT_PATH = path.join(__dirname, 'scripts/auto.sh');

  exec(`bash ${scriptPath}`, (error, stdout, stderr) => {
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

app.listen(PORT, () => {
  console.log(`🚀 Trigger server running at http://localhost:${PORT}`);
});
