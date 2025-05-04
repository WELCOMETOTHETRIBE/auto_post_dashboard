// server_trigger.js
import express from 'express';
import cors from 'cors';
import { runTriggerScript } from './triggerScript.js'; // ✅ Import named function

const app = express();
const PORT = 9001;

// ✅ Enable CORS for your deployed frontend
app.use(cors({
  origin: 'https://autopostdashboard-production.up.railway.app'
}));

app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`🚀 Trigger server running at http://localhost:${PORT}`);
});
