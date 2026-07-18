// api/transcribe.js — Audio → transcript.
// Accepts an uploaded audio blob (multipart/form-data, field "file") from the mic
// record-and-transcribe pipeline and forwards it to Groq's OpenAI-compatible Whisper
// endpoint. Returns { transcript }. Kept SEPARATE from api/parse-expense.js — the client
// chains transcribe → parse.

export const config = { api: { bodyParser: false } };

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

// Read the raw request stream into a single Buffer (bodyParser is disabled above).
async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: 'GROQ_API_KEY not set' });
  }

  // Parse the multipart upload with the Web-standard Response.formData() (undici, built into
  // the Node 18+ runtime) — no extra dependency needed.
  let file;
  try {
    const raw = await readRawBody(req);
    const contentType = req.headers['content-type'] || '';
    const form = await new Response(raw, { headers: { 'content-type': contentType } }).formData();
    file = form.get('file');
  } catch (err) {
    console.error('transcribe: could not parse upload:', err);
    return res.status(400).json({ error: 'Invalid audio upload' });
  }
  if (!file || typeof file === 'string') {
    return res.status(400).json({ error: 'No audio file provided' });
  }

  try {
    const groqForm = new FormData();
    groqForm.append('file', file, file.name || 'audio.webm');
    groqForm.append('model', 'whisper-large-v3-turbo');
    groqForm.append('response_format', 'json');

    const groqRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${GROQ_API_KEY}` },
      body: groqForm,
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error('Groq transcription error:', groqRes.status, errText.slice(0, 300));
      return res.status(502).json({ error: `Transcription failed: ${groqRes.status}` });
    }

    const data = await groqRes.json();
    const transcript = (data.text || '').toString().trim();
    return res.status(200).json({ transcript });
  } catch (err) {
    console.error('transcribe error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
