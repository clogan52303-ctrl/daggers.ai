server.jsimport express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = "PASTE_YOUR_KEY_HERE";

app.post("/analyze", async (req, res) => {
  const { artist, spotify, goal } = req.body;

  const prompt = `
You are DAGGER.AI, a blunt underground music analyst.

Analyze this artist:

Artist Name: ${artist}
Spotify Link: ${spotify}
Goal: ${goal}

Give:
- Overall Verdict
- Scores (1-10)
- What's Working
- What's Hurting
- Best Song To Push (guess if needed)
- 7 Day Plan
- 3 Promo Captions

Be direct, sharp, and realistic.
`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      })
    });

    const data = await response.json();

    res.json({
      result: data.choices[0].message.content
    });

  } catch (err) {
    res.json({ result: "Error generating analysis." });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));