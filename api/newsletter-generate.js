// api/newsletter-generate.js — Generate newsletter content with Claude (admin-triggered preview)
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const cookieHeader = req.headers.cookie || '';
  const hasAdmin = /(?:^|;\s*)admin_session=authenticated(?:;|$)/.test(cookieHeader);
  if (!hasAdmin) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ ok: false, error: 'ANTHROPIC_API_KEY not configured' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const { issueNumber, topic, notes, subscriberCount } = body;

    const prompt = `You are Marcus Chen, Travel Finance Editor at MyTripMoney.com. Write a newsletter issue.

Issue #${issueNumber || '?'}
Topic focus: ${topic || 'General — mix of travel-money tips'}
${notes ? `Editor notes: ${notes}` : ''}
Current subscriber count: ${subscriberCount || 0}

Respond ONLY with valid JSON, no markdown fences:
{
  "subject": "short catchy email subject line (under 55 chars)",
  "sections": [
    { "heading": "section emoji + title", "body": "2-3 sentences, engaging, practical" }
  ]
}

Include exactly 4-5 sections:
1. Lead/hook related to the topic
2. "Real Numbers" — a concrete cost stat or currency datapoint with takeaway
3. "Card of the Week" — a travel card / debit tip (Wise, Revolut, Schwab, Charles Schwab debit, Chase Sapphire, etc.) mentioned naturally
4. "Multi-Leg Move" — a tip specifically for trips crossing multiple countries / currencies
5. "From the Blog" — tease a blog post topic (mention mytripmoney.com/blog)

Keep the tone conversational, smart, concise. Each section body 2-3 sentences max. Never preachy.`;

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
      const errText = await response.text();
      console.error('Anthropic API error:', errText);
      return res.status(500).json({ ok: false, error: 'AI generation failed' });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return res.status(200).json({
      ok: true,
      subject: parsed.subject,
      sections: parsed.sections,
    });
  } catch (e) {
    console.error('Newsletter generate error:', e);
    return res.status(500).json({ ok: false, error: 'Failed to generate newsletter' });
  }
}
