// api/newsletter-auto.js — Auto-generate and send the weekly MyTripMoney digest
// Runs every Monday at 14:00 UTC via Vercel cron.
import { getServiceClient } from '../lib/supabase.js';
import { sendNewsletter, buildNewsletterHTML } from '../lib/email.js';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const CRON_SECRET = process.env.CRON_SECRET || '';

export default async function handler(req, res) {
  const authHeader = req.headers.authorization || '';
  const isCron = CRON_SECRET && authHeader === `Bearer ${CRON_SECRET}`;
  if (!isCron) {
    const cookieHeader = req.headers.cookie || '';
    const hasAdmin = /(?:^|;\s*)admin_session=authenticated(?:;|$)/.test(cookieHeader);
    if (!hasAdmin) {
      return res.status(401).json({ ok: false, error: 'Unauthorized' });
    }
  }

  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ ok: false, error: 'ANTHROPIC_API_KEY not set' });
  }

  try {
    const supabase = getServiceClient();

    // Count active subscribers (unsubscribed_at IS NULL)
    const { count } = await supabase
      .from('newsletter_subscribers')
      .select('id', { count: 'exact', head: true })
      .is('unsubscribed_at', null);

    if (!count || count === 0) {
      return res.status(200).json({ ok: true, message: 'No active subscribers — skipping' });
    }

    // Recent posts for context
    const { data: recentPosts } = await supabase
      .from('blog_posts')
      .select('title, slug, excerpt, category')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(5);

    const blogContext = (recentPosts || [])
      .map((p) => `- "${p.title}" (mytripmoney.com/blog/${p.slug}) — ${(p.excerpt || '').slice(0, 80)}`)
      .join('\n');

    // Issue number (best effort — table may not exist)
    let issueNum = 1;
    try {
      const { data: lastIssue } = await supabase
        .from('newsletter_issues')
        .select('issue_number')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (lastIssue?.issue_number) issueNum = lastIssue.issue_number + 1;
    } catch {}

    const prompt = `You are Marcus Chen, Travel Finance Editor at MyTripMoney.com. Write Issue #${issueNum} of the weekly MyTripMoney digest — a short, practical email about travel budgeting, multi-currency spending, and the realities of tracking money across multi-leg trips.

Recent blog posts on MyTripMoney:
${blogContext || 'No recent posts'}

Subscriber count: ${count}

Respond ONLY with valid JSON, no markdown fences:
{
  "subject": "MyTripMoney #${issueNum}: [catchy subject under 55 chars]",
  "sections": [
    { "heading": "emoji + section title", "body": "2-3 sentences" }
  ]
}

Include exactly 4 sections:
1. Lead — a timely angle on travel money (a card change, an exchange-rate window, a seasonal budgeting tip)
2. From the Blog — highlight 1-2 recent MyTripMoney posts with links (mytripmoney.com/blog/slug)
3. Real Numbers — a specific cost or currency stat with a concrete takeaway
4. Quick Tip — one actionable money-while-traveling tip

Tone: conversational, smart, like a well-traveled friend who knows money. Each section 2-3 sentences max. Never preachy.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      return res.status(500).json({ ok: false, error: 'AI generation failed' });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    if (!parsed.subject || !parsed.sections) {
      return res.status(500).json({ ok: false, error: 'AI returned invalid format' });
    }

    const { data: subscribers } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .is('unsubscribed_at', null);

    if (!subscribers || subscribers.length === 0) {
      return res.status(200).json({ ok: true, message: 'No subscribers to send to' });
    }

    const recipients = subscribers.map((s) => s.email);
    const html = buildNewsletterHTML(parsed.subject, parsed.sections);
    const results = await sendNewsletter(recipients, parsed.subject, html);

    // Log issue (best effort)
    try {
      await supabase.from('newsletter_issues').insert({
        subject: parsed.subject,
        issue_number: issueNum,
        status: 'sent',
        recipients_count: results.sent,
        content: JSON.stringify(parsed.sections),
      });
    } catch {}

    return res.status(200).json({
      ok: true,
      issue: issueNum,
      subject: parsed.subject,
      sent: results.sent,
      failed: results.failed,
    });
  } catch (e) {
    console.error('Auto newsletter error:', e);
    return res.status(500).json({ ok: false, error: `Server error: ${e?.message || String(e)}` });
  }
}
