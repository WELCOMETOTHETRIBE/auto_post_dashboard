import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5500;

// Allow CORS
app.use(cors());

// Serve your static dashboard
app.use(express.static("public")); // assuming your index.html is in "public" folder (or adjust)

app.get("/api/key", (req, res) => {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return res.status(500).json({ error: "OpenAI API Key not set." });
  }
  res.json({ key: openaiKey });
});

// Keep alive
app.get("/", (req, res) => {
  res.send("Welcome to the Tribe Dashboard 🚀");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
