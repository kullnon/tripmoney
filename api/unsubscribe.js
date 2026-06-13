// api/unsubscribe.js — One-click unsubscribe
import { getServiceClient } from '../lib/supabase.js';

export default async function handler(req, res) {
  const email = (req.query?.email || '').toString().trim().toLowerCase();

  if (!email || !email.includes('@')) {
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(unsubPage('Invalid link.', false));
  }

  try {
    const supabase = getServiceClient();
    const { data } = await supabase
      .from('newsletter_subscribers')
      .select('id, unsubscribed_at')
      .eq('email', email)
      .maybeSingle();

    res.setHeader('Content-Type', 'text/html');

    if (!data) return res.status(200).send(unsubPage('Email not found in our list.', false));
    if (data.unsubscribed_at) return res.status(200).send(unsubPage("You're already unsubscribed.", true));

    await supabase
      .from('newsletter_subscribers')
      .update({ unsubscribed_at: new Date().toISOString() })
      .eq('id', data.id);

    return res.status(200).send(unsubPage("You've been unsubscribed. Sorry to see you go.", true));
  } catch (e) {
    console.error('Unsubscribe error:', e);
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(unsubPage('Something went wrong. Please try again.', false));
  }
}

function unsubPage(message, success) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Unsubscribe — MyTripMoney</title>
</head>
<body style="margin:0;padding:0;background:#0A0F1E;font-family:system-ui,-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;color:#F0F4FF;">
  <div style="max-width:420px;text-align:center;padding:40px 24px;">
    <div style="font-size:2.5rem;margin-bottom:16px;">${success ? '👋' : '⚠️'}</div>
    <h1 style="font-size:1.3rem;font-weight:800;margin:0 0 12px;">${message}</h1>
    <p style="font-size:0.9rem;color:#8A9BC4;margin:0 0 24px;">
      ${success ? "You won't receive any more emails from us." : 'Please email andrelubin@gmail.com if you need help.'}
    </p>
    <a href="https://www.mytripmoney.com" style="display:inline-block;background:#00D4FF;color:#0A0F1E;padding:10px 24px;border-radius:10px;font-size:0.9rem;font-weight:800;text-decoration:none;">
      Back to MyTripMoney
    </a>
  </div>
</body>
</html>`;
}
