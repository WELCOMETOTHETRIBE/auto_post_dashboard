import express from 'express';
import { google } from 'googleapis';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 9001;
app.use(express.json());

// Required for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === GOOGLE SHEET CONFIG ===
const SPREADSHEET_ID = '1k-aIvAPcwc8URudZJEdDEd91kyPK9MgwVdmsm5lxC1A';
const RANGE = 'Sheet1!A2'; // Start at row 2 to avoid overwriting headers

async function getGoogleSheetsClient() {
  const keyPath = path.join(__dirname, 'key.json');
  const credentials = JSON.parse(await readFile(keyPath, 'utf-8'));

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const client = await auth.getClient();
  return google.sheets({ version: 'v4', auth: client });
}

// === API ROUTE ===
app.post('/trigger-upload', async (req, res) => {
  try {
    console.log('📥 Received request at /trigger-upload:', req.body);

    const {
      image_url,
      caption,
      hashtags,
      platform,
      publish_now,
      token_id,
      link,
      product
    } = req.body;

    // Validate required fields
    if (!image_url || !token_id) {
      return res.status(400).json({ status: 'error', message: 'Missing image_url or token_id' });
    }

    const sheets = await getGoogleSheetsClient();
    if (!sheets) throw new Error('❌ Google Sheets client not initialized.');

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          new Date().toISOString(),
          image_url,
          caption || '',
          hashtags || '',
          platform || '',
          publish_now ? 'TRUE' : 'FALSE',
          token_id,
          link || '',
          product || ''
        ]]
      }
    });

    console.log('✅ Google Sheets append response:', response.data);
    res.status(200).json({ status: 'success' });

  } catch (error) {
    console.error('❌ Google Sheets Append Error:', error.response?.data || error.message || error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Trigger server listening on http://localhost:${PORT}`);
});
