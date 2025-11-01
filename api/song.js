export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { count, mode, lyrics } = req.body;
  const apiKey = process.env.LOUDLY_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "LOUDLY_API_KEY not set in environment" });
  }

  try {
    const songs = [];

    for (let i = 0; i < count; i++) {
      // Build prompt differently based on mode
      const prompt =
        mode === "custom"
          ? `Create a full-length song with these lyrics:\n${lyrics}`
          : "Generate a professional AI-composed instrumental track with no lyrics.";

      const loudlyRes = await fetch("https://api.loudly.com/v1/tracks/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await loudlyRes.json();
      if (!loudlyRes.ok) throw new Error(data.error || "Loudly API failed");

      songs.push({
        url: data.audio_url || data.download_url || data.url || "#",
      });
    }

    res.status(200).json({ songs });
  } catch (err) {
    console.error("Loudly error:", err);
    res.status(500).json({ error: err.message || "Generation failed" });
  }
}
