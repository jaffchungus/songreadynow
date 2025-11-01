export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { count, mode, mood, genre, prompt } = req.body;
  const apiKey = process.env.LOUDLY_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'LOUDLY_API_KEY not set in environment' });
  }

  try {
    const songs = [];

    for (let i = 0; i < count; i++) {
      const payload = {
        model: "loudly-songgen-v1",
        mode: mode === 'custom' ? 'custom' : 'auto',
        prompt: mode === 'custom'
          ? `Mood: ${mood || 'Any'}, Genre: ${genre || 'Any'}, Description: ${prompt || 'AI free creativity'}`
          : 'AI auto generated track',
      };

      const loudlyRes = await fetch("https://api.loudly.com/v1/song/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
      });

      const data = await loudlyRes.json();
      if (!loudlyRes.ok) throw new Error(data.error || "Loudly API failed");

      songs.push({
        url: data.audio_url || data.download_url || data.url || "#"
      });
    }

    res.status(200).json({ songs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Generation failed' });
  }
}
