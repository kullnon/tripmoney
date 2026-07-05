// api/parse-expense.js — Voice → structured expense parser.
// Takes a short spoken transcript + the active trip currency and asks Claude to
// extract exactly ONE expense as strict JSON. Reuses the same raw-fetch Anthropic
// pattern as api/blog-generate.js (no SDK dependency, same model + error handling).
// Never returns a half-built expense — any failure returns { error } instead.

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

// Must stay in sync with CATEGORIES ids in src/TripApp.jsx.
const CATEGORY_IDS = ['flight', 'hotel', 'food', 'transport', 'activities', 'shopping', 'essentials', 'health', 'financial', 'comms', 'tips', 'other'];

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const transcript = (body.transcript || '').toString().trim();
  const currency = ((body.currency || 'USD').toString().trim()) || 'USD';

  if (!transcript) return res.status(400).json({ error: 'No transcript provided' });

  const system = `You extract a SINGLE travel expense from a short spoken phrase and return ONLY a JSON object — no prose, no markdown, no code fences.

The user's trip currency is ${currency}; any amount they say is in that currency.

Return EXACTLY this shape and nothing else:
{"amount": number, "category": string, "title": string, "confidence": "high"|"low"}

Rules:
- amount: the numeric value ONLY, e.g. 14.97 (never "1497", never "$14.97", never a string). If there is no clear amount, set amount to 0 and confidence to "low".
- category: choose the single closest id from EXACTLY this list: ${JSON.stringify(CATEGORY_IDS)}. Map merchant/context to the closest id — e.g. McDonald's / restaurant / groceries / coffee / dinner → "food"; Uber / taxi / train / bus / gas / rental car → "transport"; hotel / Airbnb / hostel → "hotel"; flight / airline / baggage fee → "flight"; museum / tour / tickets / excursion → "activities"; pharmacy / doctor / medicine → "health"; SIM / data / phone plan → "comms"; souvenirs / clothes / gifts → "shopping". If unclear, use "other".
- title: a short human label, e.g. "McDonald's", "Uber ride". Under 40 characters.
- confidence: "low" if the amount OR the category is uncertain or missing; otherwise "high".

Return only the JSON object.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 300,
        system,
        messages: [{ role: 'user', content: transcript }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error:', errText);
      return res.status(500).json({ error: `Parse failed: ${response.status}` });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    const clean = text.replace(/```json|```/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch (e) {
      console.error('parse-expense: invalid JSON from model:', clean.slice(0, 300));
      return res.status(200).json({ error: 'Could not parse that' });
    }

    // Validate + coerce — never emit a half-built expense.
    const amount = Number(parsed.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(200).json({ error: 'No amount detected' });
    }
    const category = CATEGORY_IDS.includes(parsed.category) ? parsed.category : 'other';
    const title = (typeof parsed.title === 'string' && parsed.title.trim()) ? parsed.title.trim().slice(0, 60) : '';
    const confidence = parsed.confidence === 'high' ? 'high' : 'low';

    return res.status(200).json({ amount, category, title, confidence });
  } catch (err) {
    console.error('parse-expense error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
