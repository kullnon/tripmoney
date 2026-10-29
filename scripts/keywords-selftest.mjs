// Offline check of the keyword picker (lib/seo-keywords.js, lib/keyword-overlap.js,
// lib/keyword-planner.js pickFresh). No network, no database.
//
//   node scripts/keywords-selftest.mjs

import assert from 'node:assert/strict';

import { KEYWORDS, pickKeyword, slugify } from '../lib/seo-keywords.js';
import { overlaps } from '../lib/keyword-overlap.js';
import { pickFresh } from '../lib/keyword-planner.js';

// Same theme, different post: not used. Rewordings collide.
assert.ok(!overlaps('how to avoid foreign transaction fees on multi country trips', 'how to handle multiple currencies while traveling'));
assert.ok(!overlaps('iceland trip cost breakdown for 10 days', 'greece 7 day trip cost breakdown'));
assert.ok(overlaps('wise vs revolut for travelers 2026', 'revolut vs wise for travelers'));
assert.ok(overlaps('how much cash should I carry while traveling abroad', 'how much cash should you carry when traveling abroad 2027'));

const firstAdded = KEYWORDS.findIndex((k) => k.keyword === 'greece 7 day trip cost breakdown');
assert.ok(firstAdded > 0);

// Every bank keyword used: nothing to pick. One left (a 2026-10-29 addition, which by
// construction overlaps nothing else): that one.
const all = KEYWORDS.map((k) => k.keyword);
const left = all[firstAdded];
assert.equal(pickKeyword([], all), null);
assert.equal(pickKeyword([], all.filter((k) => k !== left)).keyword, left);
// A post with the keyword's exact slug but no target_keyword counts as used.
assert.equal(pickKeyword([slugify(left)], all.filter((k) => k !== left)), null);

// The 2026-10-29 additions duplicate nothing in the bank or each other.
for (let i = firstAdded; i < KEYWORDS.length; i++) for (let j = 0; j < KEYWORDS.length; j++) {
  if (i !== j) assert.ok(!overlaps(KEYWORDS[i].keyword, KEYWORDS[j].keyword), `bank duplicates: "${KEYWORDS[i].keyword}" / "${KEYWORDS[j].keyword}"`);
}

// The planner's ideas: unknown category, empty, used and reworded ones are skipped.
const fresh = pickFresh(
  [
    { keyword: 'Revolut vs Wise for travelers', category: 'Currency' },
    { keyword: 'best beaches in thailand', category: 'Beaches' },
    { keyword: '  ', category: 'Budget' },
    { keyword: 'Lisbon 4 day trip cost breakdown', category: 'CostBreakdown' },
  ],
  ['wise vs revolut for travelers 2026'],
  [],
  slugify,
);
assert.deepEqual(fresh, { keyword: 'lisbon 4 day trip cost breakdown', category: 'CostBreakdown' });

console.log('keywords selftest: all passed');
