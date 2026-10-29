// lib/seo-keywords.js — Rotating keyword bank for MyTripMoney blog generation
// Categories: Budget, Currency, MultiLeg, AppComparison, CostBreakdown, Logistics
// When every keyword here is covered, api/blog-generate.js asks the planner
// (lib/keyword-planner.js) for a new one, so the daily post never stops.

import { isUsed } from './keyword-overlap.js';

const KEYWORDS = [
  // Cost breakdowns — high-volume informational
  { keyword: 'how much does a 2 week trip to Japan cost', category: 'CostBreakdown' },
  { keyword: 'how much does a week in Bali actually cost', category: 'CostBreakdown' },
  { keyword: 'iceland trip cost breakdown for 10 days', category: 'CostBreakdown' },
  { keyword: 'thailand backpacking budget 2026 daily cost', category: 'CostBreakdown' },
  { keyword: 'how much should I budget for a europe trip 2026', category: 'CostBreakdown' },
  { keyword: 'vietnam 2 week travel budget breakdown', category: 'CostBreakdown' },
  { keyword: 'portugal 7 day trip cost for two people', category: 'CostBreakdown' },
  { keyword: 'morocco 10 day trip cost solo traveler', category: 'CostBreakdown' },
  { keyword: 'south korea 2 week budget for first time visitors', category: 'CostBreakdown' },
  { keyword: 'mexico city trip cost for a long weekend', category: 'CostBreakdown' },
  { keyword: 'how much money do I need for a month in southeast asia', category: 'CostBreakdown' },
  { keyword: 'patagonia trip cost backpacking budget', category: 'CostBreakdown' },

  // Budgeting guides — process / how-to
  { keyword: 'how to budget for a 2 week europe trip', category: 'Budget' },
  { keyword: 'how to plan a travel budget that actually works', category: 'Budget' },
  { keyword: 'travel budget percentage breakdown by category', category: 'Budget' },
  { keyword: 'how to budget for a backpacking trip first time', category: 'Budget' },
  { keyword: 'how to save 5000 dollars for travel in 6 months', category: 'Budget' },
  { keyword: 'honeymoon budget how much to spend on a 10 day trip', category: 'Budget' },
  { keyword: 'how to build an emergency fund for travel', category: 'Budget' },
  { keyword: 'travel budget spreadsheet vs app which is better', category: 'Budget' },

  // Multi-currency / multi-leg — MyTripMoney's wedge
  { keyword: 'how to handle multiple currencies while traveling', category: 'Currency' },
  { keyword: 'best way to track expenses in multiple currencies', category: 'Currency' },
  { keyword: 'how to budget for a multi country backpacking trip', category: 'MultiLeg' },
  { keyword: 'how to track expenses across 5 countries', category: 'MultiLeg' },
  { keyword: 'best exchange rate strategy for international travel', category: 'Currency' },
  { keyword: 'should I use cash or card abroad in europe 2026', category: 'Currency' },
  { keyword: 'how to avoid foreign transaction fees on multi country trips', category: 'Currency' },
  { keyword: 'wise vs revolut for travelers 2026', category: 'Currency' },
  { keyword: 'multi currency budgeting for digital nomads', category: 'Currency' },
  { keyword: 'how to split expenses with friends across currencies', category: 'Currency' },
  { keyword: 'managing multi leg trip expenses without losing track', category: 'MultiLeg' },
  { keyword: 'how to handle currency conversion when tracking expenses', category: 'Currency' },

  // App comparisons — commercial intent, MyTripMoney shows up
  { keyword: 'best travel expense tracker app 2026', category: 'AppComparison' },
  { keyword: 'trail wallet vs trabee pocket which is better', category: 'AppComparison' },
  { keyword: 'best free travel budget app for iphone', category: 'AppComparison' },
  { keyword: 'tricount vs splitwise for group travel expenses', category: 'AppComparison' },
  { keyword: 'best travel expense app that works offline', category: 'AppComparison' },
  { keyword: 'best app to track expenses on a long trip', category: 'AppComparison' },
  { keyword: 'trip cost calculator vs expense tracker which do I need', category: 'AppComparison' },
  { keyword: 'best travel budget app for couples', category: 'AppComparison' },
  { keyword: 'alternatives to trail wallet for travel budgeting', category: 'AppComparison' },
  { keyword: 'best multi currency travel expense app 2026', category: 'AppComparison' },

  // Solo / group / family — segmented intent
  { keyword: 'solo travel budget 30 days southeast asia', category: 'CostBreakdown' },
  { keyword: 'how to split travel expenses fairly with friends', category: 'Budget' },
  { keyword: 'family of 4 europe trip budget 2 weeks', category: 'CostBreakdown' },
  { keyword: 'couples travel budget how to manage joint expenses', category: 'Budget' },
  { keyword: 'group trip expense tracking who paid for what', category: 'MultiLeg' },
  { keyword: 'solo female travel budget south america', category: 'CostBreakdown' },
  { keyword: 'how to share travel expenses without awkward money talks', category: 'Budget' },

  // Logistics — searchy practical
  { keyword: 'best travel credit cards for foreign transaction fees 2026', category: 'Logistics' },
  { keyword: 'how much cash should I carry while traveling abroad', category: 'Logistics' },
  { keyword: 'atm fees abroad how to avoid them in 2026', category: 'Logistics' },
  { keyword: 'travel insurance cost is it worth it 2026', category: 'Logistics' },
  { keyword: 'best debit card for international travel no fees', category: 'Logistics' },
  { keyword: 'how to budget for unexpected travel expenses', category: 'Budget' },
  { keyword: 'tipping culture by country complete guide 2026', category: 'Logistics' },

  // Trip-type specific
  { keyword: 'round the world trip budget how much do you really need', category: 'CostBreakdown' },
  { keyword: '1 month sabbatical travel budget breakdown', category: 'CostBreakdown' },
  { keyword: 'city break weekend budget 3 days europe', category: 'CostBreakdown' },
  { keyword: 'cruise vs land trip cost comparison 2026', category: 'CostBreakdown' },
  { keyword: 'road trip budget per day USA 2026', category: 'CostBreakdown' },
  { keyword: 'interrail budget for a month in europe 2026', category: 'CostBreakdown' },

  // Evergreen / seasonal
  { keyword: 'best month to travel cheap to europe 2026', category: 'Logistics' },
  { keyword: 'shoulder season travel deals worth chasing', category: 'Logistics' },
  { keyword: 'how to find cheap flights for multi city trips', category: 'Logistics' },
  { keyword: 'off season caribbean travel cost savings', category: 'CostBreakdown' },

  // Direct intent — these convert
  { keyword: 'how to stop overspending on vacation', category: 'Budget' },
  { keyword: 'why I went over budget on my last trip and how to fix it', category: 'Budget' },
  { keyword: 'vacation spending guilt how to enjoy your money abroad', category: 'Budget' },

  // Added 2026-10-29 when the bank ran dry (64 posts written).
  { keyword: 'greece 7 day trip cost breakdown', category: 'CostBreakdown' },
  { keyword: 'sri lanka 2 week trip cost for couples', category: 'CostBreakdown' },
  { keyword: 'new york city 4 day trip cost on a budget', category: 'CostBreakdown' },
  { keyword: 'peru machu picchu trip cost breakdown', category: 'CostBreakdown' },
  { keyword: 'costa rica 10 day trip budget', category: 'CostBreakdown' },
  { keyword: 'turkey istanbul and cappadocia trip cost', category: 'CostBreakdown' },
  { keyword: 'how much does a safari in kenya cost', category: 'CostBreakdown' },
  { keyword: 'london 5 day trip cost for first timers', category: 'CostBreakdown' },
  { keyword: 'how to set a daily travel budget and stick to it', category: 'Budget' },
  { keyword: 'how much spending money for a week in europe', category: 'Budget' },
  { keyword: 'how to budget for a destination wedding as a guest', category: 'Budget' },
  { keyword: 'how to plan a trip on a 1000 dollar budget', category: 'Budget' },
  { keyword: 'how to cut accommodation costs on a long trip', category: 'Budget' },
  { keyword: 'dynamic currency conversion should you pay in local currency', category: 'Currency' },
  { keyword: 'how to get local currency before you travel', category: 'Currency' },
  { keyword: 'what to do with leftover foreign currency', category: 'Currency' },
  { keyword: 'how to read prices abroad without overspending', category: 'Currency' },
  { keyword: 'how to budget a 3 country trip in one month', category: 'MultiLeg' },
  { keyword: 'open jaw flights explained to save on multi city trips', category: 'MultiLeg' },
  { keyword: 'how to plan a europe rail itinerary on a budget', category: 'MultiLeg' },
  { keyword: 'how to track spending per city on a multi stop trip', category: 'MultiLeg' },
  { keyword: 'splitwise alternatives for travel', category: 'AppComparison' },
  { keyword: 'best app to convert currency offline while traveling', category: 'AppComparison' },
  { keyword: 'free google sheets template for trip expenses', category: 'AppComparison' },
  { keyword: 'android apps for tracking travel spending', category: 'AppComparison' },
  { keyword: 'how to keep receipts organized while traveling', category: 'Logistics' },
  { keyword: 'travel money safety how to avoid pickpockets and card skimming', category: 'Logistics' },
  { keyword: 'what to do if your card is blocked abroad', category: 'Logistics' },
  { keyword: 'how to claim vat refunds when shopping abroad', category: 'Logistics' },
  { keyword: 'how much to tip tour guides and drivers abroad', category: 'Logistics' },
];

export function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

// Pick a keyword no post has covered yet. usedKeywords are blog_posts.target_keyword
// (every post stores the keyword it was written for); slugs catch posts without one.
export function pickKeyword(existingSlugs, usedKeywords = []) {
  const shuffled = [...KEYWORDS].sort(() => Math.random() - 0.5);
  return shuffled.find((kw) => !isUsed(kw.keyword, usedKeywords, existingSlugs, slugify)) || null;
}

export function getKeywordCount() {
  return KEYWORDS.length;
}

export { KEYWORDS };
