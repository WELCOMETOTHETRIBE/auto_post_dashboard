// server_trigger.js
import express from 'express';
import cors from 'cors';
import { runTriggerScript } from './triggerScript.js';

const app = express();
const PORT = process.env.PORT || 9001; // ✅ Use Railway or fallback to 9001

// ✅ CORS configuration for your frontend
app.use(cors({
  origin: 'https://autopostdashboard-production.up.railway.app',
  optionsSuccessStatus: 200
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

// === SERVER START ===
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Trigger server running on port ${PORT}`);
});
