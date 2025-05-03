import express from 'express';
import { exec } from 'child_process';
import cors from 'cors';

const app = express();
const PORT = 9001;

// Allow CORS from anywhere or limit to your dashboard origin
app.use(cors());
app.use(express.json());

app.post('/trigger-upload', (req, res) => {
  const scriptPath = '/Users/patrick/Desktop/Desktop/scripts/auto.sh';

  exec(`bash "${scriptPath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Script execution error: ${error.message}`);
      console.error(`stderr: ${stderr}`);
      return res.status(500).json({ status: 'error', message: 'Script failed to run' });
    }

    console.log(`✅ Script output:\n${stdout}`);
    res.status(200).json({ status: 'success', message: 'Script executed successfully' });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Local script trigger server listening at http://localhost:${PORT}`);
});
