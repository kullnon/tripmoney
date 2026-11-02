// api/subscribe.js — Newsletter subscription + welcome email
import { getServiceClient } from '../lib/supabase.js';
import { sendWelcomeEmail } from '../lib/email.js';
import { isSynthetic } from '../lib/synthetic.js';

export default async function handler(req, res) {
  // CORS — allow the SPA to call this from the same domain or preview deploys
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const email = body.email?.trim()?.toLowerCase();

    if (!email || !email.includes('@') || email.length > 200) {
      return res.status(400).json({ ok: false, error: 'Invalid email' });
    }

    const supabase = getServiceClient();

    // Flow Watchdog probe (signed x-maestro-synthetic header, lib/synthetic.js): same
    // validation as above, then prove the write (insert, read back, delete) with a unique
    // reserved address and send NO welcome email.
    if (isSynthetic(req.headers, 'mytripmoney')) {
      const probe = `flow-watchdog+${Date.now()}@synthetic.invalid`;
      const ins = await supabase.from('newsletter_subscribers').insert({ email: probe, source: 'flow_watchdog' }).select('id').maybeSingle();
      if (ins.error || !ins.data) return res.status(503).json({ ok: false, synthetic: { write: 'failed', error: ins.error?.message || 'no row returned' } });
      const back = await supabase.from('newsletter_subscribers').select('id').eq('id', ins.data.id).maybeSingle();
      const del = await supabase.from('newsletter_subscribers').delete().eq('id', ins.data.id);
      if (back.error || !back.data || del.error) {
        return res.status(503).json({ ok: false, synthetic: { write: 'failed', error: back.error?.message || del.error?.message || 'read-back missing' } });
      }
      return res.status(200).json({ ok: true, synthetic: { write: 'verified' } });
    }

    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id, unsubscribed_at')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      if (existing.unsubscribed_at) {
        // Re-subscribe — clear unsubscribed_at
        await supabase
          .from('newsletter_subscribers')
          .update({ unsubscribed_at: null, subscribed_at: new Date().toISOString() })
          .eq('id', existing.id);
        sendWelcomeEmail(email).catch(() => {});
        return res.status(200).json({ ok: true, message: 'Welcome back!' });
      }
      return res.status(200).json({ ok: true, message: 'Already subscribed' });
    }

    await supabase.from('newsletter_subscribers').insert({
      email,
      source: body.source || 'website',
    });

    sendWelcomeEmail(email).catch(() => {});

    return res.status(200).json({ ok: true, message: 'Subscribed!' });
  } catch (e) {
    console.error('Subscribe error:', e);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
}
