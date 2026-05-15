// api/blog-generate.js — AI-powered daily blog post generator
// Triggered by Vercel Cron daily at 11:00 UTC, or manually with admin cookie / cron secret.
// Reads today's editor_decisions row to choose what keyword to write — falls back
// to lib/seo-keywords.js pickKeyword if no decision exists or GSC was unavailable.
import { getServiceClient } from '../lib/supabase.js';
import { pickKeyword } from '../lib/seo-keywords.js';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const CRON_SECRET = process.env.CRON_SECRET || '';
const AUTHORS = ['marcus-chen'];

export default async function handler(req, res) {
  // Auth: cron secret OR admin cookie
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

    const { data: existing } = await supabase.from('blog_posts').select('slug');
    const existingSlugs = (existing || []).map((p) => p.slug);

    // ---------- Editor Agent integration ----------
    const today = new Date().toISOString().slice(0, 10);
    const { data: editorDecision } = await supabase
      .from('editor_decisions')
      .select('*')
      .eq('decision_date', today)
      .is('consumed_at', null)
      .maybeSingle();

    let keyword = null;
    let category = 'Budget';
    let decisionSource = 'fallback';

    if (editorDecision && editorDecision.target_keyword) {
      keyword = editorDecision.target_keyword;
      decisionSource = 'editor';
      const picked = editorDecision.gsc_data_snapshot?.picked;
      if (picked && picked.category) {
        category = picked.category;
      } else if (editorDecision.gsc_data_snapshot?.query) {
        const q = String(editorDecision.gsc_data_snapshot.query).toLowerCase();
        if (q.includes('vs') || q.includes('compared') || q.includes('which is better')) category = 'AppComparison';
        else if (q.includes('currency') || q.includes('exchange') || q.includes('foreign transaction')) category = 'Currency';
        else if (q.includes('multi') || q.includes('countries') || q.includes('legs')) category = 'MultiLeg';
        else if (q.includes('cost') || q.includes('how much')) category = 'CostBreakdown';
        else if (q.includes('card') || q.includes('atm') || q.includes('cash') || q.includes('insurance')) category = 'Logistics';
        else category = 'Budget';
      }
      console.log(`[blog-generate] Using editor decision (${editorDecision.decision_type}): ${keyword}`);
    } else {
      const kw = pickKeyword(existingSlugs);
      if (!kw) {
        return res.status(400).json({ ok: false, error: 'All keywords used — add more to lib/seo-keywords.js' });
      }
      keyword = kw.keyword;
      category = kw.category;
      console.log(`[blog-generate] Using keyword-bank fallback: ${keyword}`);
    }

    // Mark decision consumed
    if (editorDecision) {
      await supabase
        .from('editor_decisions')
        .update({ consumed_at: new Date().toISOString() })
        .eq('id', editorDecision.id);
    }

    const author = AUTHORS[Math.floor(Math.random() * AUTHORS.length)];

    const prompt = `You are Marcus Chen, Travel Finance Editor at MyTripMoney.com — the travel expense tracker that handles multi-leg journeys, 100+ currencies, and real-world travel chaos. Your readers are travelers who care about getting the most out of their trip budget without obsessing over every dollar. Write a blog post optimized for the following long-tail keyword.

TARGET KEYWORD: "${keyword}"
CATEGORY: ${category}

Respond ONLY with valid JSON. No markdown fences, no preamble. Structure:
{
  "title": "SEO-optimized title (include the keyword naturally, 55-65 chars)",
  "slug": "url-friendly-slug-max-60-chars",
  "excerpt": "Compelling meta description / excerpt (150-160 chars)",
  "meta_title": "SEO title tag (include keyword, 55-65 chars)",
  "meta_desc": "Meta description for search engines (150-160 chars)",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "body_html": "<p>Full article HTML...</p>"
}

ARTICLE REQUIREMENTS:
- 1200-1800 words
- Semantic HTML: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>
- 3-5 <h2> sections with descriptive subheadings
- Include the target keyword 3-5 times naturally
- Include real-world budget numbers, currency considerations, and concrete examples
- Every post must include at least ONE section discussing how to track expenses across multiple currencies / multiple legs / multiple cards — this is MyTripMoney's wedge
- End with a clear CTA: <p><strong>Stop guessing what you're spending abroad.</strong> MyTripMoney tracks every dollar across every currency and every leg of your trip — automatically. <a href="https://mytripmoney.com/auth">Start free →</a></p>
- Tone: conversational, authoritative, friend-who-travels-a-lot — never preachy about money
- Add internal link to /pricing at least once where natural
- Use 2026 when referencing the current year
- DO NOT use the word "tapestry" or "nestled" or "embark"
- DO NOT mention TropicAtlas or any other Maestro property
- DO NOT include images or image tags`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error:', errText);
      return res
        .status(500)
        .json({ ok: false, error: `AI generation failed: ${response.status} ${errText.slice(0, 200)}` });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    const clean = text.replace(/```json|```/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch {
      console.error('Failed to parse AI response:', clean.slice(0, 200));
      return res.status(500).json({ ok: false, error: 'AI returned invalid JSON' });
    }

    if (!parsed.title || !parsed.slug || !parsed.body_html) {
      return res.status(500).json({ ok: false, error: 'AI response missing required fields' });
    }

    const slug = parsed.slug.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 80);

    if (existingSlugs.includes(slug)) {
      return res.status(400).json({ ok: false, error: `Slug "${slug}" already exists` });
    }

    const { error: insertError } = await supabase.from('blog_posts').insert({
      slug,
      title: parsed.title,
      excerpt: parsed.excerpt || '',
      body_html: parsed.body_html,
      category,
      author: 'MyTripMoney',
      author_slug: author,
      meta_title: parsed.meta_title || parsed.title,
      meta_desc: parsed.meta_desc || parsed.excerpt || '',
      tags: parsed.tags || [],
      target_keyword: keyword,
      status: 'published',
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return res.status(500).json({ ok: false, error: 'Failed to save post' });
    }

    try {
      await supabase.from('activity_feed').insert({
        type: 'blog',
        message: `New blog post published: "${parsed.title}"`,
      });
    } catch {}

    return res.status(200).json({
      ok: true,
      slug,
      title: parsed.title,
      keyword,
      author,
      decision_source: decisionSource,
      url: `https://mytripmoney.com/blog/${slug}`,
    });
  } catch (e) {
    console.error('Blog generate error:', e);
    return res.status(500).json({ ok: false, error: `Server error: ${e?.message || String(e)}` });
  }
}
