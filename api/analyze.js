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

  const { artistName, spotifyLink, soundcloudLink, genre, goal, latestSong } = req.body || {};

  if (!artistName || (!spotifyLink && !soundcloudLink)) {
    return res.status(400).json({
      error: 'Artist name and at least one profile link are required.'
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'Missing OPENAI_API_KEY environment variable.'
    });
  }

  const systemPrompt = `You are DAGGER.AI, a blunt but useful underground music growth analyst.

Your job is to analyze an artist profile and give:
1. An overall verdict
2. Scores from 1-10 for:
   - Branding Strength
   - Marketability
   - Consistency
   - Replay Value
   - Visual Identity
   - Blow-Up Potential
3. A section called “What’s Working”
4. A section called “What’s Hurting You”
5. A section called “Best Song To Push”
6. A section called “7-Day Action Plan”
7. A section called “Promo Captions”

Rules:
- Be direct, sharp, and honest
- Sound like an experienced A&R mixed with a creative strategist
- Do not sound robotic
- Do not use fake praise
- Do not insult the artist
- Focus on clarity, branding, presentation, momentum, and audience growth
- Keep advice practical and specific
- Assume the artist is independent and trying to grow with limited resources
- If profile details are limited, say you are inferring from the supplied context
- Output valid JSON only using this shape:
{
  "overallVerdict": "...",
  "scores": {
    "brandingStrength": 0,
    "marketability": 0,
    "consistency": 0,
    "replayValue": 0,
    "visualIdentity": 0,
    "blowUpPotential": 0
  },
  "working": ["..."],
  "hurting": ["..."],
  "bestSongToPush": {
    "track": "...",
    "why": "..."
  },
  "sevenDayPlan": ["Day 1: ...", "Day 2: ...", "Day 3: ...", "Day 4: ...", "Day 5: ...", "Day 6: ...", "Day 7: ..."],
  "promoCaptions": ["...", "...", "..."]
}`;

  const userPrompt = `Analyze this artist using the limited profile information below. If you cannot inspect the links directly, infer from the artist's lane, goal, and any hints in the URLs or context.

Artist name: ${artistName}
Spotify link: ${spotifyLink || 'Not provided'}
SoundCloud link: ${soundcloudLink || 'Not provided'}
Genre: ${genre || 'Not provided'}
Primary goal: ${goal || 'Not provided'}
Latest song: ${latestSong || 'Not provided'}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        temperature: 0.8,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || 'OpenAI request failed.'
      });
    }

    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      return res.status(500).json({ error: 'No content returned from model.' });
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      return res.status(500).json({ error: 'Model returned invalid JSON.' });
    }

    return res.status(200).json(parsed);
  } catch (error) {
    return res.status(500).json({
      error: error?.message || 'Unexpected server error.'
    });
  }
}
