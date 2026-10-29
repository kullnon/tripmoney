// lib/keyword-planner.js — a new keyword when the bank in lib/seo-keywords.js is used up.
//
// The bank ran dry on 2026-09-24 and blog-generate answered 400 every day after.
// When pickKeyword finds nothing, blog-generate asks Claude for a handful of new
// long-tail keywords in MyTripMoney's categories and takes the first that overlaps no
// keyword already written. Add the good ones to the bank by hand when convenient.

import { isUsed } from './keyword-overlap.js';

export const CATEGORIES = ['Budget', 'Currency', 'MultiLeg', 'AppComparison', 'CostBreakdown', 'Logistics'];

export async function planKeyword({ apiKey, usedKeywords, usedSlugs, slugify }) {
  const prompt = `You plan blog topics for MyTripMoney.com, a travel expense tracker for multi-leg trips in 100+ currencies. Readers are travelers who want the most out of their trip budget: what a trip costs, how to pay abroad, how to track and split spending.

Propose 8 new long-tail search keywords, each the phrase a real person types into Google, in these categories: ${CATEGORIES.join(', ')}.
Never repeat or reword a keyword already written:
${usedKeywords.map((k) => `- ${k}`).join('\n')}

Return ONLY JSON, no prose: {"keywords":[{"keyword":"...","category":"CostBreakdown"}]}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-sonnet-4-5', max_tokens: 1024, messages: [{ role: 'user', content: prompt }] }),
  });
  if (!response.ok) throw new Error(`keyword planner: ${response.status} ${(await response.text()).slice(0, 200)}`);
  const data = await response.json();
  const text = (data.content?.[0]?.text || '').replace(/```json|```/g, '').trim();
  const ideas = JSON.parse(text).keywords || [];
  return pickFresh(ideas, usedKeywords, usedSlugs, slugify);
}

/** The first idea with a known category that no written keyword or slug covers. */
export function pickFresh(ideas, usedKeywords, usedSlugs, slugify) {
  for (const idea of ideas) {
    const keyword = String(idea?.keyword || '').trim().toLowerCase();
    if (!keyword || keyword.length > 120 || !CATEGORIES.includes(idea.category)) continue;
    if (isUsed(keyword, usedKeywords, usedSlugs, slugify)) continue;
    return { keyword, category: idea.category };
  }
  return null;
}
