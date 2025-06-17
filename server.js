/*  ZOLX Inc. – minimal Express API
    © 2025 ZOLX Inc.  */

import 'dotenv/config';
import express     from 'express';
import cors        from 'cors';
import nodemailer  from 'nodemailer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import path        from 'node:path';
import { fileURLToPath } from 'node:url';
import fs          from 'node:fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* ───────────── 1 | Init ───────────── */
const app    = express();
const PORT   = process.env.PORT || 5000;
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

app.use(cors());
app.use(express.json());

/* ───────────── 2 | Serve static assets (OPTIONAL) ─────────────
   If you don’t host public_html separately (e.g. Netlify),
   drop the folder one level above and uncomment the line below.   */
// app.use('/', express.static(path.join(__dirname, '..', 'public_html')));

/* ───────────── 3 | Store basic signup info ───────────── */
const USERS_FILE = path.join(__dirname, 'clients.json');

app.post('/api/signup', async (req, res) => {
  const email = req.body?.email;
  if (!email) return res.status(400).end();
  try {
    let existing = [];
    try { existing = JSON.parse(await fs.readFile(USERS_FILE, 'utf8')); } catch {}
    if (!existing.includes(email)) {
      existing.push(email);
      await fs.writeFile(USERS_FILE, JSON.stringify(existing, null, 2));
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
});

/* ───────────── 3 | Chat → GPT and e-mail copy ───────────── */
app.post('/api/chat', async (req, res) => {
  try {
    const prompt = (req.body?.prompt || '').slice(0, 2_000);   // ≤ 2 k chars
    const user   = req.body?.user ?? 'anonymous';

    /* 3.1  Compose system prompt */
    const system = `
You are ZOLX Inc.’s laboratory concierge.
Given a user's sample description, decide which of these instruments apply:
 • Thermo Nicolet iN10-MX FT-IR micro-imaging
 • Agilent Cary 5000 UV-Vis-NIR (175-3300 nm, solid/liquid)
 • Perkin Elmer TGA-GC/MS (decomposition & evolved-gas)
 • Thermo K-Alpha XPS (surface chemistry) – add-on
Return:
1) short answer whether ZOLX can analyse it,
2) recommended preparation,
3) estimated turnaround & cost bracket (low/med/high),
4) polite note if not feasible.
Strictly ≤ 200 words.
    `.trim();

    /* 3.2  Call Gemini */
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-1.5-pro',
    });

    const result = await model.generateContent({
      contents: [
        { role: 'user', parts: [{ text: `${system}\n\n${prompt}` }] }
      ],
      generationConfig: { maxOutputTokens: 350, temperature: 0.4 },
    });

    const reply = result.response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    /* 3.3  Fire-and-forget e-mail to internal lab inbox */
    sendMail({
      subject: `[ZOLX Lab Lead] ${user}`,
      html: `<b>User query:</b><pre>${prompt}</pre><hr><b>Sent to user:</b><pre>${reply}</pre>`
    }).catch(console.error);

    res.json({ reply });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI service unavailable' });
  }
});

/* ───────────── 4 | Nodemailer helper ───────────── */
async function sendMail({ subject, html }) {
  const t = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: +process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  await t.sendMail({
    from: `"ZOLX Bot" <${process.env.SMTP_USER}>`,
    to:   process.env.NOTIFY_EMAIL,
    subject, html
  });
}

/* ───────────── 5 | Boot ───────────── */
app.listen(PORT, () => {
  console.log(`ZOLX API listening on :${PORT}`);
});
