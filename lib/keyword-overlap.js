// lib/keyword-overlap.js — is this keyword a post we already have?
//
// Replaces the old "first three slug words" check, which treated every keyword
// sharing a three-word slug prefix with a post ("how-to-avoid-…") as used and so
// reported the bank exhausted with keywords never written (found on WadWall and
// MyTripMoney, 2026-10-29).
// Two keywords overlap when most of the shorter one's content words are in the
// other: rewordings collide, different questions on the same theme do not.

const STOP = new Set([
  'a', 'an', 'the', 'to', 'of', 'for', 'and', 'or', 'in', 'on', 'your', 'you', 'is', 'are',
  'how', 'what', 'why', 'should', 'do', 'does', 'can', 'with', 'vs', 'versus', 'it', 'really',
  'actually', 'i', 'my', 'that', 'when', 'which', 'best', 'way', 'ways',
]);

export function keywordKey(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/\b(19|20)\d\d\b/g, ' ')
    .replace(/[^a-z0-9$%/]+/g, ' ')
    .split(' ')
    .filter((w) => w && !STOP.has(w))
    .map((w) => w.replace(/(ies|es|s)$/, (m) => (m === 'ies' ? 'y' : '')));
}

export function overlaps(a, b) {
  const ka = new Set(keywordKey(a));
  const kb = new Set(keywordKey(b));
  if (ka.size === 0 || kb.size === 0) return false;
  const [small, big] = ka.size <= kb.size ? [ka, kb] : [kb, ka];
  let shared = 0;
  for (const w of small) if (big.has(w)) shared++;
  return shared / small.size >= 0.75;
}

/** True when the keyword overlaps any used keyword or matches a used slug exactly. */
export function isUsed(keyword, usedKeywords = [], usedSlugs = [], slugify = (s) => s) {
  if (usedSlugs.includes(slugify(keyword))) return true;
  return usedKeywords.some((u) => overlaps(u, keyword));
}
