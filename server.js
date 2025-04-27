// server.js

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ASSISTANT_ID = process.env.ASSISTANT_ID;

// Handle __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Route to fetch both the API Key and Assistant ID
app.get('/api/key', (req, res) => {
    if (!OPENAI_API_KEY || !ASSISTANT_ID) {
        return res.status(500).json({ error: 'Environment variables not set properly' });
    }
    res.json({ key: OPENAI_API_KEY, assistantId: ASSISTANT_ID });
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
