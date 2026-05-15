// api/editor-agent.js — Daily editorial decision based on GSC + Supabase
// Triggered by Vercel Cron at 09:00 UTC. Writes one row to editor_decisions per day.
// The 11:00 UTC blog-generate cron reads that row to pick what to write.
import { Resend } from 'resend';
import { getServiceClient } from '../lib/supabase.js';
import { fetchTopQueries } from '../lib/gsc-client.js';
import { pickKeyword } from '../lib/seo-keywords.js';

const CRON_SECRET = process.env.CRON_SECRET || '';
const EDITOR_EMAIL_TO = 'andrelubin@gmail.com';

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

  const supabase = getServiceClient();
  const today = new Date().toISOString().slice(0, 10);

  // Idempotency: if today's decision exists, return it
  const { data: existing } = await supabase
    .from('editor_decisions')
    .select('*')
    .eq('decision_date', today)
    .maybeSingle();

  if (existing) {
    return res.status(200).json({ ok: true, status: 'already_decided', decision: existing });
  }

  // 1. Pull GSC data (graceful degradation if API fails)
  let gscRows = [];
  let gscError = null;
  try {
    gscRows = await fetchTopQueries(28, 1000);
  } catch (e) {
    gscError = e?.message || 'gsc fetch failed';
    console.error('[editor-agent] GSC fetch failed:', gscError);
  }

  // 2. Pull existing posts (with target_keyword + slug)
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, title, target_keyword, published_at')
    .order('published_at', { ascending: false });

  const usedSlugs = (posts || []).map((p) => p.slug);
  const slugByKeyword = new Map();
  for (const p of posts || []) {
    const tk = (p.target_keyword || '').toLowerCase().trim();
    if (tk) slugByKeyword.set(tk, p.slug);
  }

  // 3. Decide
  const decision = decide(gscRows, slugByKeyword, usedSlugs, gscError);

  // 4. Write decision
  const { data: written, error: writeErr } = await supabase
    .from('editor_decisions')
    .insert({ decision_date: today, ...decision })
    .select()
    .single();

  if (writeErr) {
    console.error('[editor-agent] write failed:', writeErr);
    return res.status(500).json({ ok: false, error: `write_failed: ${writeErr.message}` });
  }

  // 5. Email Andy (best-effort)
  try {
    await sendDailyEmail(decision, gscError);
  } catch (e) {
    console.error('[editor-agent] email failed:', e?.message);
  }

  return res.status(200).json({
    ok: true,
    decision: written,
    gsc_status: gscError ? 'unavailable' : 'ok',
    gsc_rows_fetched: gscRows.length,
  });
}

// ---------- decision rules ----------

function decide(gscRows, slugByKeyword, usedSlugs, gscError) {
  if (gscError || gscRows.length === 0) {
    return fallbackDecision(
      usedSlugs,
      gscError ? `GSC unavailable: ${gscError}` : 'No GSC rows yet (site may be too new)'
    );
  }

  // Aggregate GSC by query
  const byQuery = new Map();
  for (const r of gscRows) {
    const q = r.query.toLowerCase().trim();
    if (!q) continue;
    const cur = byQuery.get(q) || { impressions: 0, clicks: 0, position: 0, pages: new Set() };
    cur.impressions += r.impressions;
    cur.clicks += r.clicks;
    cur.position = Math.max(cur.position, r.position);
    cur.pages.add(r.page);
    byQuery.set(q, cur);
  }

  const sortedQueries = Array.from(byQuery.entries()).sort(
    (a, b) => b[1].impressions - a[1].impressions
  );

  // RULE 1 — RECOVER: existing post, position 11-30, real impression volume
  for (const [q, stats] of sortedQueries) {
    if (stats.impressions >= 50 && stats.position >= 11 && stats.position <= 30 && slugByKeyword.has(q)) {
      return {
        decision_type: 'refresh_post',
        target_keyword: q,
        target_post_slug: slugByKeyword.get(q),
        reasoning: `Existing post on "${q}" has ${stats.impressions} impressions but ranks ~#${Math.round(stats.position)}. Refreshing should push it into top 10.`,
        urgency_score: stats.impressions >= 200 ? 9 : 7,
        gsc_data_snapshot: {
          rule: 'recover',
          query: q,
          impressions: stats.impressions,
          clicks: stats.clicks,
          position: stats.position,
          pages: Array.from(stats.pages),
        },
      };
    }
  }

  // RULE 2 — BOOST: query has impressions, position 11-30, NO post yet
  for (const [q, stats] of sortedQueries) {
    if (stats.impressions >= 30 && stats.position >= 11 && stats.position <= 30 && !slugByKeyword.has(q)) {
      return {
        decision_type: 'new_post',
        target_keyword: q,
        target_post_slug: null,
        reasoning: `Site is already getting ${stats.impressions} impressions for "${q}" (avg pos ~#${Math.round(stats.position)}) without a dedicated post. A targeted post should win this query.`,
        urgency_score: stats.impressions >= 100 ? 9 : 6,
        gsc_data_snapshot: {
          rule: 'boost',
          query: q,
          impressions: stats.impressions,
          clicks: stats.clicks,
          position: stats.position,
          pages: Array.from(stats.pages),
        },
      };
    }
  }

  // RULE 3 — fallback
  return fallbackDecision(usedSlugs, 'No high-priority GSC signals — picking from keyword bank');
}

function fallbackDecision(usedSlugs, reason) {
  const picked = pickKeyword(usedSlugs);
  if (!picked) {
    return {
      decision_type: 'fallback',
      target_keyword: null,
      target_post_slug: null,
      reasoning: `${reason}. WARNING: keyword bank exhausted — add more to lib/seo-keywords.js.`,
      urgency_score: 1,
      gsc_data_snapshot: { rule: 'fallback_exhausted', reason },
    };
  }
  return {
    decision_type: 'fallback',
    target_keyword: picked.keyword,
    target_post_slug: null,
    reasoning: `${reason}. Selected: "${picked.keyword}" (${picked.category}).`,
    urgency_score: 4,
    gsc_data_snapshot: { rule: 'fallback', reason, picked },
  };
}

// ---------- email ----------

async function sendDailyEmail(d, gscError) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    console.warn('[editor-agent] RESEND_API_KEY or EMAIL_FROM missing — skipping email');
    return;
  }

  const resend = new Resend(apiKey);
  const today = new Date().toISOString().slice(0, 10);
  const labelByType = {
    new_post: 'Write new post',
    refresh_post: 'Refresh existing post',
    kill_keyword: 'Kill underperforming keyword',
    fallback: 'Fallback (no strong signal)',
  };

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 580px; color: #111;">
      <h2 style="color: #0EA5E9; margin: 0 0 8px;">MyTripMoney Editor — ${today}</h2>
      <p style="margin: 0 0 16px; color: #4b5563;">Daily decision for the 11:00 UTC blog-generate cron.</p>

      <table style="width:100%; border-collapse: collapse; margin: 8px 0 16px;">
        <tr><td style="padding: 6px 0; color:#666; width: 130px;">Decision</td><td style="padding: 6px 0; font-weight:600;">${labelByType[d.decision_type]}</td></tr>
        ${d.target_keyword ? `<tr><td style="padding: 6px 0; color:#666;">Keyword</td><td style="padding: 6px 0; font-weight:600;">${escape(d.target_keyword)}</td></tr>` : ''}
        ${d.target_post_slug ? `<tr><td style="padding: 6px 0; color:#666;">Post</td><td style="padding: 6px 0;"><a href="https://mytripmoney.com/blog/${escape(d.target_post_slug)}">/blog/${escape(d.target_post_slug)}</a></td></tr>` : ''}
        <tr><td style="padding: 6px 0; color:#666;">Urgency</td><td style="padding: 6px 0;">${d.urgency_score}/10</td></tr>
      </table>

      <p style="background: #f0f9ff; border-left: 3px solid #0EA5E9; padding: 12px 16px; margin: 0 0 16px;"><strong>Why:</strong> ${escape(d.reasoning)}</p>

      ${gscError ? `<p style="background:#fef3c7;border-left:3px solid #b45309;padding:10px 14px;margin:0 0 16px;color:#7c2d12;font-size:13px;"><strong>Note:</strong> GSC data was unavailable today (${escape(gscError)}). Decision was made without search signal.</p>` : ''}

      <hr style="border:none; border-top:1px solid #e5e7eb; margin:20px 0;">
      <p style="color:#9ca3af; font-size:12px; margin:0;">Auto-generated by MyTripMoney editor-agent. Decision will be consumed by the next blog-generate run.</p>
    </div>
  `;

  await resend.emails.send({
    from,
    to: EDITOR_EMAIL_TO,
    subject: `MyTripMoney Editor — ${today} (${labelByType[d.decision_type]})`,
    html,
  });
}

function escape(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
