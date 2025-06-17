# ZOLX Demo Website

This project contains a small Express server and static front‑end used to showcase the ZOLX wastewater up‑cycle concept and provide an AI chatbot.

## Running locally

```bash
npm install
cp env.example .env        # edit with your credentials
node server.js
```

The app serves `/public_html` when deployed, but you can open `index.html` directly for a static preview.  
Image assets are embedded as data URIs so no binary files are required.

## Environment variables

- `PORT` – server port
- `GOOGLE_API_KEY` – API key for Gemini
- `GEMINI_MODEL` – model name, e.g. `gemini-1.5-pro`
- SMTP settings (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `NOTIFY_EMAIL`) for contact emails

User names and e‑mails collected via sign‑up are stored in `clients.json`.
