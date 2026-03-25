export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      artistName,
      spotifyLink,
      soundcloudLink,
      genre,
      goal,
      latestSong,
      notes
    } = req.body || {};

    if (!artistName) {
      return res.status(400).json({ error: 'Artist name is required.' });
    }

    if (!spotifyLink && !soundcloudLink) {
      return res.status(400).json({ error: 'Add at least one profile link.' });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Missing OPENAI_API_KEY environment variable.' });
    }

    const systemPrompt = `
You are DAGGER.AI, a blunt but useful underground music growth analyst.

Return VALID JSON ONLY.
Do not include markdown.
Do not include code fences.
Do not include extra commentary outside JSON.

Use this exact shape:
{
  "overallVerdict": "string",
  "scores": {
    "brandingStrength": 0,
    "marketability": 0,
    "consistency": 0,
    "replayValue": 0,
    "visualIdentity": 0,
    "blowUpPotential": 0
  },
  "working": ["string", "string", "string"],
  "hurting": ["string", "string", "string"],
  "bestSongToPush": {
    "track": "string",
    "why": "string"
  },
  "sevenDayPlan": [
    "Day 1: string",
    "Day 2: string",
    "Day 3: string",
    "Day 4: string",
    "Day 5: string",
    "Day 6: string",
    "Day 7: string"
  ],
  "promoCaptions": ["string", "string", "string"]
}
`;

    const userPrompt = `
Analyze this artist using only the information below.

Artist Name: ${artistName}
Spotify Link: ${spotifyLink || 'Not provided'}
SoundCloud Link: ${soundcloudLink || 'Not provided'}
Genre: ${genre || 'Not provided'}
Main Goal: ${goal || 'Not provided'}
Latest Song: ${latestSong || 'Not provided'}
Extra Notes: ${notes || 'Not provided'}
`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${apiKey}\`,
        'HTTP-Referer': 'https://YOUR-VERCEL-URL.vercel.app',
        'X-Title': 'DAGGER.AI'
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct:free',
        temperature: 0.8,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || 'OpenRouter request failed.',
        raw: data
      });
    }

    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(500).json({
        error: 'No content returned from model.',
        raw: data
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      return res.status(500).json({
        error: 'Model returned invalid JSON.',
        raw: content
      });
    }

    return res.status(200).json(parsed);
  } catch (error) {
    return res.status(500).json({
      error: error?.message || 'Unexpected server error.'
    });
  }
}
