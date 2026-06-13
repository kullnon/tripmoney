// lib/email.js — Resend email utility for MyTripMoney
import { Resend } from 'resend';

let _resend = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY || '');
  return _resend;
}

function getFrom() {
  return process.env.EMAIL_FROM || 'MyTripMoney <onboarding@resend.dev>';
}

export async function sendWelcomeEmail(to) {
  const html = getWelcomeHTML();
  try {
    const { error } = await getResend().emails.send({
      from: getFrom(),
      to,
      subject: 'Welcome to MyTripMoney',
      html,
    });
    if (error) {
      console.error('Resend welcome email error:', error);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Failed to send welcome email:', e);
    return false;
  }
}

export async function sendNewsletter(recipients, subject, htmlTemplate) {
  const results = { sent: 0, failed: 0 };

  // Resend batch send — up to 100 per call
  for (let i = 0; i < recipients.length; i += 100) {
    const batch = recipients.slice(i, i + 100);
    const emails = batch.map((to) => ({
      from: getFrom(),
      to,
      subject,
      // Personalize the unsubscribe link per-recipient
      html: htmlTemplate.replace(/\{\{EMAIL\}\}/g, encodeURIComponent(to)),
    }));

    try {
      const { error } = await getResend().batch.send(emails);
      if (error) {
        console.error('Batch send error:', error);
        results.failed += batch.length;
      } else {
        results.sent += batch.length;
      }
    } catch (e) {
      console.error('Batch send exception:', e);
      results.failed += batch.length;
    }
  }

  return results;
}

function getWelcomeHTML() {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:system-ui,-apple-system,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:40px 20px;">
  <div style="background:#0A0F1E;border-radius:16px;overflow:hidden;border:1px solid #1E2D45;">
    <div style="padding:40px 32px;text-align:center;">
      <div style="font-size:2.5rem;margin-bottom:16px;">✈️</div>
      <h1 style="color:#F0F4FF;font-size:1.5rem;font-weight:800;margin:0 0 16px;line-height:1.3;">
        You're in. Welcome to MyTripMoney.
      </h1>
      <p style="color:#8A9BC4;font-size:0.95rem;line-height:1.6;margin:0 0 28px;">
        Each week you'll get one short email from Marcus Chen — travel-budget intel, multi-currency tips, and honest reviews of the apps and cards real travelers use. No fluff, no spam.
      </p>
      <a href="https://www.mytripmoney.com/auth?next=/app" style="display:inline-block;background:#00D4FF;color:#0A0F1E;padding:14px 32px;border-radius:10px;font-size:0.95rem;font-weight:800;text-decoration:none;">
        Start tracking free →
      </a>
    </div>
  </div>
  <div style="text-align:center;padding:24px 0;">
    <p style="color:#8A9BC4;font-size:0.75rem;margin:0 0 8px;">You're receiving this because you signed up at mytripmoney.com</p>
    <a href="https://www.mytripmoney.com/api/unsubscribe?email={{EMAIL}}" style="color:#4A5880;font-size:0.75rem;">Unsubscribe</a>
  </div>
</div>
</body>
</html>`;
}

export function buildNewsletterHTML(subject, sections) {
  const sectionsHTML = sections
    .map(
      (s) => `
    <div style="margin-bottom:28px;">
      <h2 style="color:#F0F4FF;font-size:1.1rem;font-weight:700;margin:0 0 8px;">${s.heading}</h2>
      <p style="color:#cbd5e1;font-size:0.92rem;line-height:1.6;margin:0;">${s.body}</p>
    </div>`
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:system-ui,-apple-system,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:40px 20px;">
  <div style="background:#0A0F1E;border-radius:16px;overflow:hidden;border:1px solid #1E2D45;">
    <div style="padding:40px 32px;">
      <div style="text-align:center;margin-bottom:28px;">
        <div style="font-size:1.5rem;margin-bottom:8px;">📬</div>
        <h1 style="color:#F0F4FF;font-size:1.35rem;font-weight:800;margin:0;line-height:1.3;">
          ${subject}
        </h1>
        <p style="color:#4A5880;font-size:0.75rem;margin:8px 0 0;">From Marcus Chen, Travel Finance Editor</p>
      </div>
      <div style="height:1px;background:rgba(138,155,196,0.15);margin-bottom:28px;"></div>
      ${sectionsHTML}
      <div style="text-align:center;margin-top:32px;">
        <a href="https://www.mytripmoney.com/auth?next=/app" style="display:inline-block;background:#00D4FF;color:#0A0F1E;padding:12px 28px;border-radius:10px;font-size:0.9rem;font-weight:800;text-decoration:none;">
          Start tracking free →
        </a>
      </div>
    </div>
  </div>
  <div style="text-align:center;padding:24px 0;">
    <p style="color:#8A9BC4;font-size:0.75rem;margin:0 0 8px;">You're receiving this from MyTripMoney</p>
    <a href="https://www.mytripmoney.com/api/unsubscribe?email={{EMAIL}}" style="color:#4A5880;font-size:0.75rem;">Unsubscribe</a>
  </div>
</div>
</body>
</html>`;
}
