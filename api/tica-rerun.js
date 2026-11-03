// api/tica-rerun.js — Tica's relay for "re-run a failed job once" (GET ?path=/api/<job>).
//
// Tica (tica-telegram) cannot hold this project's CRON_SECRET: it is a Sensitive Vercel var that
// nobody can read back. She has her own secret, TICA_RELAY_SECRET (Sensitive here,
// RERUN_SECRET_TRIPMONEY on tica-telegram), and this function calls the job for her with the
// real CRON_SECRET. Only the jobs in RERUNNABLE: never the newsletter, which emails subscribers.
import { timingSafeEqual } from 'node:crypto';

export const config = { maxDuration: 300 };

const RERUNNABLE = new Set(['/api/editor-agent', '/api/blog-generate']);

function sameSecret(given, expected) {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export default async function handler(req, res) {
  const relaySecret = process.env.TICA_RELAY_SECRET || '';
  const cronSecret = process.env.CRON_SECRET || '';
  if (!relaySecret || !cronSecret) {
    return res.status(500).json({ error: 'TICA_RELAY_SECRET or CRON_SECRET missing on server' });
  }
  if (!sameSecret(req.headers.authorization || '', `Bearer ${relaySecret}`)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const path = String(req.query.path || '');
  if (!RERUNNABLE.has(path)) {
    return res.status(400).json({ error: `not a job Tica may re-run: ${path.slice(0, 100)}` });
  }
  const started = Date.now();
  try {
    const r = await fetch(`https://${req.headers.host}${path}`, {
      headers: { authorization: `Bearer ${cronSecret}`, 'x-rerun-by': 'tica' },
    });
    const body = (await r.text()).slice(0, 300);
    console.log(JSON.stringify({ route: 'tica-rerun', path, status: r.status, ms: Date.now() - started }));
    return res.status(r.ok ? 200 : 502).json({ path, status: r.status, ms: Date.now() - started, body });
  } catch (err) {
    console.error(JSON.stringify({ route: 'tica-rerun', path, error: String(err && err.message || err) }));
    return res.status(502).json({ path, error: String(err && err.message || err) });
  }
}
