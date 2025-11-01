# 🎶 S0NGR3ADYN0W — Self-Hosted AI Song Generator

A completely free, local AI song generator powered by **Meta’s MusicGen** (from AudioCraft).  
No API keys, no Stripe, no external payments — all runs locally on your GPU or in a Colab.

---

## 🚀 Features
- Generate **1–5** unique songs per request  
- Modes:
  - **Auto**: full AI generation  
  - **Mood**: you set a mood (e.g. “chill”, “dark”, “happy”)  
  - **Custom**: provide your own lyrics  
- Fully dark, professional web UI  
- Download generated `.wav` songs instantly  

---

## 🧠 Requirements
- Python 3.9+
- PyTorch (with CUDA if you want GPU speed)
- FFmpeg (`sudo apt install ffmpeg` on Ubuntu)
- A GPU with ≥8GB VRAM recommended

---

## 🛠️ Setup

```bash
git clone https://github.com/yourusername/S0NGR3ADYN0W.git
cd S0NGR3ADYN0W
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python server.py
