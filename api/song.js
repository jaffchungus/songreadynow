export default async function handler(req, res) {
  try {
    if (req.method !== 'POST')
      return res.status(405).json({ error: 'Method not allowed' });

    const { mode, amount, mood, lyrics } = req.body;
    const apiKey = process.env.LOUDLY_API_KEY;

    if (!apiKey)
      return res.status(500).json({ error: 'LOUDLY_API_KEY not set' });

    const prompts = [];
    for (let i = 0; i < amount; i++) {
      let prompt = 'Create a high-quality AI-generated song.';
      if (mode === 'mood') prompt += ` Mood: ${mood}.`;
      if (mode === 'custom') prompt += ` Lyrics: ${lyrics}`;
      prompts.push(prompt);
    }

    // Simulate Loudly API (you can replace with real endpoint)
    const songs = [];
    for (const p of prompts) {
      const r = await fetch('https://api.loudly.com/v1/generate-song', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text_prompt: p,
          duration: 30
        })
      });

      if (!r.ok) {
        const text = await r.text();
        console.error('LOUDLY API error:', text);
        throw new Error(text);
      }

      const result = await r.json();
      songs.push({ url: result.audio_url });
    }

    return res.status(200).json({ songs });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
