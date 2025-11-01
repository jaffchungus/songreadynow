export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { count, mode, genre, mood, lyrics } = req.body;
  const apiKey = process.env.LOUDLY_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'LOUDLY_API_KEY not set in environment' });
  }

  try {
    const songs = [];

    for (let i = 0; i < count; i++) {
      let promptParts = [];

      if (mode === 'custom') {
        promptParts.push(`Lyrics: ${lyrics}`);
        if (genre) promptParts.push(`Genre: ${genre}`);
        if (mood) promptParts.push(`Mood: ${mood}`);
        promptParts.push(`Create a song based on the above lyrics.`);
      } else {
        // Auto mode: minimal user input, full AI chooses
        promptParts.push(`Generate a professional original song. No lyrics provided.`);
        // you could optionally add random mood/genre here if you like
      }

      const prompt = promptParts.join(' | ');

      const response = await fetch("https://api.loudly.com/v1/song/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({ prompt })
      });

      const data = await response.json();
      if (!response.ok) {
        console.error("Loudly API error", data);
        throw new Error(data.error || "Loudly API failed");
      }

      songs.push({
        url: data.audio_url || data.download_url || data.url
      });
    }

    res.status(200).json({ songs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Generation failed" });
  }
}
