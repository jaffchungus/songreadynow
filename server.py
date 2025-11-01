from flask import Flask, request, jsonify, send_from_directory
import os, uuid, torch
from pathlib import Path
from audiocraft.models import MusicGen
from audiocraft.data.audio import audio_write

app = Flask(__name__, static_folder='static', static_url_path='/')

OUT_DIR = Path("output")
OUT_DIR.mkdir(exist_ok=True)

MODEL_NAME = "facebook/musicgen-small"
device = "cuda" if torch.cuda.is_available() else "cpu"

print(f"🎶 Loading {MODEL_NAME} on {device}...")
model = MusicGen.get_pretrained(MODEL_NAME, device=device)
model.set_generation_params(duration=20.0)  # 20-second songs

@app.route('/api/song', methods=['POST'])
def generate_song():
    data = request.get_json() or {}
    mode = data.get('mode', 'auto')
    count = int(min(max(int(data.get('count', 1)), 1), 5))
    mood = data.get('mood', '').strip()
    lyrics = data.get('lyrics', '').strip()

    if mode == 'custom' and not lyrics:
        return jsonify({"error": "Custom mode requires lyrics"}), 400

    prompts = []
    for i in range(count):
        if mode == 'custom':
            p = f"Create a full song with lyrics: {lyrics}. Mood: {mood or 'default'}."
        elif mode == 'mood':
            p = f"Generate a {mood or 'pleasant'} song with vocals and full music."
        else:
            p = "Generate an original professional song with vocals and instruments."
        prompts.append(p)

    songs = []
    try:
        for idx, prompt in enumerate(prompts):
            print(f"🎵 Generating song {idx+1}/{count}: {prompt[:80]}...")
            audio = model.generate(descriptions=[prompt])
            if isinstance(audio, (list, tuple)):
                audio = audio[0]
            tensor = audio[0] if audio.dim() == 3 else audio
            fname = f"song_{uuid.uuid4().hex[:8]}_{idx}.wav"
            path = OUT_DIR / fname
            audio_write(str(path.with_suffix('')), tensor, model.sample_rate, format='wav')
            songs.append({"url": f"/output/{path.name}"})
    except Exception as e:
        print("❌ Generation error:", e)
        return jsonify({"error": str(e)}), 500

    return jsonify({"songs": songs}), 200

@app.route('/output/<path:filename>')
def serve_output(filename):
    return send_from_directory(str(OUT_DIR.resolve()), filename)

@app.route('/')
def home():
    return send_from_directory('static', 'index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=7860)
