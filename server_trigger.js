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
const RANGE = 'Sheet1!A1'; // Adjust if your sheet uses a different tab name or starts elsewhere

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

    const sheets = await getGoogleSheetsClient();

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          new Date().toISOString(),
          image_url,
          caption,
          hashtags,
          platform,
          publish_now ? 'TRUE' : 'FALSE',
          token_id,
          link,
          product
        ]]
      }
    });

    console.log('✅ Data appended to Google Sheet.');
    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('❌ Google Sheets Append Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Trigger server listening on http://localhost:${PORT}`);
});
