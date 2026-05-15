// api/subscribe.js — Newsletter subscription + welcome email
import { getServiceClient } from '../lib/supabase.js';
import { sendWelcomeEmail } from '../lib/email.js';

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
