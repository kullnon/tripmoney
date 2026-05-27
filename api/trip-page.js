// api/trip-page.js — server-rendered /trip/[destination] budget guide
// Routed via vercel.json rewrite: /trip/:destination -> /api/trip-page?slug=:destination
//
// Mirrors the api/blog-post.js pattern: returns a complete HTML document with
// inline styles, JSON-LD (WebApplication + FAQPage), OG/Twitter cards, and a
// static cost breakdown that crawlers can index without running JS. The
// interactive estimator lives at /?destination=:slug and is one click away.

import { destinationCosts, DEFAULT_ORIGIN } from '../lib/destinationCosts.js';
import { getAuthor } from '../lib/authors.js';

const SITE = 'https://mytripmoney.com';

export default function handler(req, res) {
  const slug = (req.query?.slug || req.query?.destination || '')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 60);

  const dest = destinationCosts[slug];
  if (!dest) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    return res.status(404).send(renderNotFound());
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  // Cost data only changes when we redeploy; cache aggressively at the edge.
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800');
  return res.status(200).send(renderTripPage(slug, dest));
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function fmtUSD(n) {
  return '$' + Math.round(n).toLocaleString('en-US');
}

function dailyTotal(tier) {
  return tier.accommodation + tier.food + tier.transport + tier.activities;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// SSR has no client state, so we default to the US flight estimate here.
// The interactive estimator on the homepage lets the user pick any of the
// 12 origin countries, so the copy below tells them where to go for that.
function defaultFlightUSD(dest) {
  const fe = dest.flightEstimates || {};
  return fe[DEFAULT_ORIGIN] ?? 0;
}

function buildIntro(dest) {
  const mid = dailyTotal(dest.midRange);
  const budget = dailyTotal(dest.budget);
  const lux = dailyTotal(dest.luxury);
  const weekMid = mid * 7;
  const p1 = `${dest.name} sits in a price band where mid-range travelers typically spend around ${fmtUSD(mid)} per day on the ground — about ${fmtUSD(weekMid)} for a full week before flights. Backpackers on a tight budget can get by on roughly ${fmtUSD(budget)} a day staying in hostels and eating at local spots, while luxury travelers booking 4–5 star hotels and fine dining should plan for closer to ${fmtUSD(lux)} per day.`;
  const p2 = `International flights from a major US hub to ${dest.name} run roughly ${fmtUSD(defaultFlightUSD(dest))} round-trip in economy class, though shoulder-season and advance-purchase fares can land well below that. The estimator below adds flights, accommodation, food, local transport, and activities into a single number you can save and track during the trip — and lets you pick your own departing country.`;
  return { p1, p2 };
}

function buildQuickAnswer(dest) {
  const weekMid = dailyTotal(dest.midRange) * 7;
  return `A 7-day mid-range trip to ${dest.name} costs approximately ${fmtUSD(weekMid)} per person, including accommodation, food, transport, and activities. Flights from the US add roughly ${fmtUSD(defaultFlightUSD(dest))} (use the estimator to see costs from other countries).`;
}

// Region-based seasonality hints for the "best time" FAQ. We don't pretend to
// know every micro-climate — just a useful default per broad region/destination.
const BEST_TIME = {
  paris: 'April–May and September–October offer the best balance of weather, lower hotel prices, and fewer crowds.',
  rome: 'April, May, and October are the cheapest months with pleasant weather — avoid August when locals leave and prices stay high.',
  barcelona: 'May–June and September–October are shoulder season — warm, dry, and 20–30% cheaper than July/August peak.',
  london: 'November to early March (excluding Christmas week) has the lowest hotel rates; May and September are the weather sweet spot.',
  amsterdam: 'April–May and September–October — tulip season early, golden light later, half the summer crowd.',
  lisbon: 'March–May and October are warm, dry, and noticeably cheaper than June–August peak.',
  prague: 'March–April and October–November have low prices, walkable weather, and minimal cruise-tour overflow.',
  vienna: 'April–May and September–October — pleasant temperatures, off-peak hotel rates.',
  budapest: 'March–April and October are cheapest; thermal baths are best in the colder months anyway.',
  santorini: 'May and September–October — warm sea, lower ferry/hotel prices, none of the August chaos.',
  reykjavik: 'September and February–April balance cost and Northern Lights viewing; June–August is most expensive.',
  'amalfi-coast': 'May and September–early October — Mediterranean weather at 30–40% lower hotel rates than July/August.',
  istanbul: 'April–May and September–October — mild weather, cheaper hotels, no summer humidity.',
  marrakech: 'October–November and March–April — warm but not punishing, with shoulder-season hotel pricing.',
  cairo: 'October–November and February–March — cooler desert temps and lower tour prices than peak December.',
  'cape-town': 'September–November (Cape spring) — warm, dry, and noticeably cheaper than the December–February summer peak.',
  dubai: 'November and March–April — bearable temperatures with lower hotel rates than the December–February peak.',
  tokyo: 'May, June, and October–November avoid both cherry-blossom price spikes and the rainy season.',
  kyoto: 'Mid-May to early June and October–November — pleasant weather, lower hotel rates than the cherry-blossom and autumn-leaf peaks.',
  seoul: 'April–June and September–October — mild weather, shoulder-season hotel rates.',
  bangkok: 'November–February is the dry season — cheaper hotels show up May–October if you can handle rain.',
  phuket: 'May–October is low season — rooms are 30–50% cheaper but rain interrupts beach days.',
  hanoi: 'October–April is cooler and drier; July–August is humid but cheapest.',
  bali: 'April–May and September–October — dry season without the July–August premium.',
  singapore: 'February–April is the driest stretch; hotel prices stay relatively flat year-round, so optimize on weather.',
  'hong-kong': 'October–early December — coolest weather and lowest hotel rates outside Chinese New Year.',
  sydney: 'September–November (spring) — warm, dry, before December–February peak; March–May is the other shoulder.',
  queenstown: 'April–May and September–October — bookend the ski season with cheaper rooms and great hiking.',
  cancun: 'May–June and November–early December — outside spring break and US Christmas, before hurricane peak (August–October).',
  tulum: 'May–June and November — sweet spot between US holidays and hurricane season.',
  'punta-cana': 'May–June and November–early December — outside the December–April US-winter peak.',
  'costa-rica': 'May and November are shoulder months — green-season pricing without peak rain.',
  'mexico-city': 'October–November and February–April — dry, mild, and cheaper than the December holiday spike.',
  'rio-de-janeiro': 'September–October and April–May — warm, dry, and 30%+ cheaper than December–February.',
  cartagena: 'May and September–November are shoulder months — same Caribbean weather, lower hotel rates than the December–April peak.',
  'buenos-aires': 'March–May (fall) and September–November (spring) — mild weather, low season pricing.',
  cusco: 'April–May and September–October — dry season without the June–August Machu Picchu peak.',
  'new-york': 'January–early March and September–November — best hotel deals; avoid Christmas week and Fashion Week peaks.',
  maldives: 'May and November shoulder weeks — still mostly dry, dramatically cheaper than December–April peak.',
  zanzibar: 'June and September–October — dry season without the July–August peak.',
};

function buildFaqs(dest, slug) {
  const mid = dest.midRange;
  const dailyFood = mid.food;
  const dailyTotalMid = dailyTotal(mid);
  const weekMid = dailyTotalMid * 7;
  const budget = dailyTotal(dest.budget);
  const lux = dailyTotal(dest.luxury);

  const bestTime = BEST_TIME[slug] || 'Shoulder seasons (typically April–May and September–October) offer the best balance of weather and lower prices.';

  // "How many days" — quick rule of thumb based on price tier.
  // Cheaper destinations reward longer stays; expensive ones suit shorter ones.
  let daysAdvice;
  if (dailyTotalMid < 80) {
    daysAdvice = `${dest.name} rewards longer stays — 7 to 14 days lets you slow down, explore beyond the tourist core, and average down the per-day cost of the flight. Most travelers spend 5–7 days as a first visit.`;
  } else if (dailyTotalMid < 180) {
    daysAdvice = `Most travelers spend 4–7 days in ${dest.name}. Four days covers the main attractions, while a full week lets you take a day trip or two without rushing. Longer stays of 10+ days work well if you're combining it with a nearby destination.`;
  } else {
    daysAdvice = `${dest.name} is expensive on a per-day basis, so 3–5 days is the sweet spot for most travelers. Beyond a week, the daily cost compounds quickly. If you have more time, consider pairing it with a cheaper neighboring destination to balance the overall budget.`;
  }

  return [
    {
      question: `What's the daily food cost in ${dest.name}?`,
      answer: `For mid-range travelers eating a mix of restaurant meals and casual local spots, expect around ${fmtUSD(dailyFood)} per person per day for food and drinks in ${dest.name} in 2026. Budget travelers eating street food and self-catering breakfast can hold it to ${fmtUSD(dest.budget.food)} a day, while fine dining and hotel restaurants push the daily food spend to ${fmtUSD(dest.luxury.food)} or more.`,
    },
    {
      question: `Is ${dest.name} expensive for tourists?`,
      answer: `${dest.name} runs about ${fmtUSD(dailyTotalMid)} per person per day for mid-range travel covering accommodation, food, local transport, and activities. That puts it on the ${dailyTotalMid < 80 ? 'cheaper' : dailyTotalMid < 180 ? 'mid-range' : 'expensive'} end compared to other popular destinations. A full week at the mid-range tier comes to roughly ${fmtUSD(weekMid)} per person before flights. Budget travelers can do it for around ${fmtUSD(budget)} a day; luxury travelers should plan for ${fmtUSD(lux)}+ daily.`,
    },
    {
      question: `How many days do you need in ${dest.name}?`,
      answer: daysAdvice,
    },
    {
      question: `What's the best time to visit ${dest.name} for budget travel?`,
      answer: bestTime,
    },
  ];
}

function renderTripPage(slug, dest) {
  const author = getAuthor('marcus-chen');
  const title = `How Much Does a Trip to ${dest.name} Cost? 2026 Budget Guide | MyTripMoney`;
  const desc = `Plan your ${dest.name} trip budget for 2026. Daily costs for accommodation, food, transport, and activities across budget, mid-range, and luxury travel styles.`;
  const url = `${SITE}/trip/${slug}`;
  const intro = buildIntro(dest);
  const quick = buildQuickAnswer(dest);
  const faqs = buildFaqs(dest, slug);

  const webAppLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'MyTripMoney Travel Budget Calculator',
    applicationCategory: 'TravelApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0' },
    description: 'Free travel budget calculator and spending tracker for 40+ destinations.',
    url: SITE,
  };

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' },
      { '@type': 'ListItem', position: 2, name: 'Trip Budget Guides', item: SITE + '/' },
      { '@type': 'ListItem', position: 3, name: dest.name, item: url },
    ],
  };

  const tiers = [
    { id: 'budget',   label: 'Budget',    data: dest.budget,   blurb: 'Hostels, street food, public transit' },
    { id: 'midRange', label: 'Mid-range', data: dest.midRange, blurb: '3-star hotels, restaurant meals' },
    { id: 'luxury',   label: 'Luxury',    data: dest.luxury,   blurb: '4–5 star, fine dining, private transport' },
  ];

  const tierRows = tiers.map((t) => `
    <div class="tier">
      <div class="tier-head">
        <div class="tier-label">${esc(t.label)}</div>
        <div class="tier-total">${fmtUSD(dailyTotal(t.data))}<span class="tier-unit">/day</span></div>
      </div>
      <div class="tier-blurb">${esc(t.blurb)}</div>
      <div class="tier-grid">
        <div><span class="tier-cat">🏨 Accommodation</span><span class="tier-val">${fmtUSD(t.data.accommodation)}</span></div>
        <div><span class="tier-cat">🍽️ Food</span><span class="tier-val">${fmtUSD(t.data.food)}</span></div>
        <div><span class="tier-cat">🚗 Local transport</span><span class="tier-val">${fmtUSD(t.data.transport)}</span></div>
        <div><span class="tier-cat">🎫 Activities</span><span class="tier-val">${fmtUSD(t.data.activities)}</span></div>
      </div>
      <div class="tier-week">7 days: <strong>${fmtUSD(dailyTotal(t.data) * 7)}</strong> per person</div>
    </div>
  `).join('');

  const faqHtml = faqs.map((f) => `
    <div class="faq-item">
      <h2 class="faq-q">${esc(f.question)}</h2>
      <p class="faq-a">${esc(f.answer)}</p>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <link rel="canonical" href="${url}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${url}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="MyTripMoney">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(desc)}">
  <link rel="icon" type="image/png" href="/favicon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=Sora:wght@600;700;800;900&display=swap" rel="stylesheet">
  <script type="application/ld+json">${JSON.stringify(webAppLd)}</script>
  <script type="application/ld+json">${JSON.stringify(faqLd)}</script>
  <script type="application/ld+json">${JSON.stringify(breadcrumbLd)}</script>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body { background:#0A0F1E; color:#F0F4FF; font-family:'DM Sans',-apple-system,sans-serif; }
    a { color:#00D4FF; }
    .nav { position:sticky; top:0; z-index:10; background:rgba(10,15,30,0.92); backdrop-filter:blur(16px); border-bottom:1px solid #1E2D45; padding:16px 0; }
    .container { max-width:880px; margin:0 auto; padding:0 24px; }
    .nav-row { display:flex; justify-content:space-between; align-items:center; }
    .logo { font-family:Sora,sans-serif; font-weight:800; font-size:20px; color:#F0F4FF; text-decoration:none; }
    .logo .accent { color:#00D4FF; }
    .nav-links { display:flex; gap:24px; align-items:center; }
    .nav-link { color:#8A9BC4; font-size:14px; font-weight:600; text-decoration:none; }
    .btn { background:#00D4FF; color:#0A0F1E; border:none; border-radius:10px; padding:10px 20px; font-size:14px; font-weight:800; cursor:pointer; text-decoration:none; display:inline-block; }
    .btn-lg { padding:16px 28px; font-size:16px; border-radius:14px; }
    main { padding:48px 0 80px; }
    .crumbs { color:#8A9BC4; font-size:13px; margin-bottom:20px; }
    .crumbs a { color:#8A9BC4; text-decoration:none; }
    h1.page-title { font-family:Sora,sans-serif; font-size:clamp(28px,4.5vw,44px); font-weight:900; letter-spacing:-1.2px; line-height:1.1; margin-bottom:18px; color:#F0F4FF; }
    .byline { display:flex; gap:12px; align-items:center; margin-bottom:24px; padding-bottom:20px; border-bottom:1px solid #1E2D45; }
    .avatar { width:40px; height:40px; border-radius:50%; background:#1A2235; border:1px solid #1E2D45; object-fit:cover; display:block; }
    .by-name { font-weight:700; color:#F0F4FF; font-size:14px; }
    .by-name a { color:#00D4FF; text-decoration:none; }
    .by-role { color:#8A9BC4; font-size:12px; }
    .by-updated { color:#4A5880; font-size:13px; margin-left:auto; }
    .quick-answer { background:linear-gradient(135deg,#1A2235,#0A0F1E); border:1px solid #00D4FF55; border-radius:16px; padding:20px 24px; margin-bottom:32px; }
    .quick-label { color:#00D4FF; font-size:11px; font-weight:800; letter-spacing:1px; text-transform:uppercase; margin-bottom:8px; }
    .quick-body { color:#F0F4FF; font-size:17px; line-height:1.55; font-weight:500; }
    .intro p { color:#cbd5e1; font-size:16px; line-height:1.75; margin-bottom:16px; }
    .estimator-cta { background:#111827; border:2px solid #00D4FF44; border-radius:20px; padding:28px; text-align:center; margin:36px 0; }
    .estimator-cta h3 { font-family:Sora,sans-serif; color:#F0F4FF; font-size:22px; font-weight:800; margin-bottom:10px; letter-spacing:-0.4px; }
    .estimator-cta p { color:#8A9BC4; font-size:14px; margin-bottom:18px; }
    .section-title { font-family:Sora,sans-serif; color:#F0F4FF; font-size:22px; font-weight:800; margin:36px 0 16px; letter-spacing:-0.4px; }
    .tier { background:#1A2235; border:1px solid #1E2D45; border-radius:16px; padding:20px 22px; margin-bottom:14px; }
    .tier-head { display:flex; justify-content:space-between; align-items:baseline; }
    .tier-label { font-family:Sora,sans-serif; font-size:18px; font-weight:800; color:#F0F4FF; }
    .tier-total { font-family:Sora,sans-serif; font-size:24px; font-weight:900; color:#00D4FF; }
    .tier-unit { font-size:13px; color:#8A9BC4; font-weight:500; margin-left:2px; }
    .tier-blurb { color:#8A9BC4; font-size:13px; margin: 4px 0 14px; }
    .tier-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:8px; }
    .tier-grid > div { display:flex; justify-content:space-between; padding:8px 10px; background:#0A0F1E; border-radius:8px; }
    .tier-cat { color:#8A9BC4; font-size:13px; }
    .tier-val { color:#F0F4FF; font-size:13px; font-weight:700; }
    .tier-week { margin-top:12px; padding-top:12px; border-top:1px solid #1E2D45; color:#8A9BC4; font-size:13px; }
    .tier-week strong { color:#F0F4FF; }
    .faq { margin-top:20px; }
    .faq-item { padding:18px 0; border-bottom:1px solid #1E2D45; }
    .faq-q { font-family:Sora,sans-serif; font-size:17px; font-weight:700; color:#F0F4FF; margin-bottom:8px; line-height:1.4; }
    .faq-a { color:#cbd5e1; font-size:15px; line-height:1.7; }
    .footer { border-top:1px solid #1E2D45; padding:36px 0; text-align:center; color:#4A5880; font-size:13px; }
    .footer a { color:#8A9BC4; text-decoration:none; }
    .footer a:hover { color:#00D4FF; }
    @media (max-width:600px) {
      .tier-grid { grid-template-columns:1fr; }
      .nav-links { gap:14px; }
    }
  </style>
</head>
<body>
  <nav class="nav">
    <div class="container nav-row">
      <a href="/" class="logo"><span>My</span><span class="accent">Trip</span><span>Money</span></a>
      <div class="nav-links">
        <a href="/#pricing" class="nav-link">Pricing</a>
        <a href="https://blog.mytripmoney.com" class="nav-link">Blog</a>
        <a href="/auth?next=/app" class="btn">Get Started</a>
      </div>
    </div>
  </nav>
  <main>
    <div class="container">
      <div class="crumbs"><a href="/">← Back to budget calculator</a></div>
      <h1 class="page-title">How much does a trip to ${esc(dest.name)} cost in 2026?</h1>
      <div class="byline">
        <img class="avatar" src="${esc(author.image)}" alt="${esc(author.name)}" onerror="this.style.display='none'">
        <div>
          <div class="by-name"><a href="/">${esc(author.name)}</a></div>
          <div class="by-role">${esc(author.role)}</div>
        </div>
        <div class="by-updated">Last updated: ${todayISO()}</div>
      </div>

      <div class="quick-answer">
        <div class="quick-label">Quick answer</div>
        <div class="quick-body">${esc(quick)}</div>
      </div>

      <div class="intro">
        <p>${esc(intro.p1)}</p>
        <p>${esc(intro.p2)}</p>
      </div>

      <h2 class="section-title">Daily cost breakdown by travel style</h2>
      ${tierRows}

      <div class="estimator-cta">
        <h3>Run the numbers for your trip</h3>
        <p>Adjust the days, travelers, and home currency — get a total in seconds, then save it to start tracking.</p>
        <a class="btn btn-lg" href="/?destination=${esc(slug)}">Estimate my ${esc(dest.name)} trip →</a>
      </div>

      <h2 class="section-title">${esc(dest.name)} budget FAQ</h2>
      <div class="faq">
        ${faqHtml}
      </div>
    </div>
  </main>
  <footer class="footer">
    <div class="container">© 2026 MyTripMoney · <a href="/">Budget calculator</a> · <a href="/#pricing">Pricing</a> · <a href="https://blog.mytripmoney.com">Blog</a></div>
  </footer>
</body>
</html>`;
}

function renderNotFound() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Destination not found — MyTripMoney</title>
  <meta name="robots" content="noindex">
</head>
<body style="margin:0;background:#0A0F1E;color:#F0F4FF;font-family:system-ui,-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;">
  <div style="text-align:center;padding:24px;">
    <div style="font-size:3rem;margin-bottom:12px;">🧭</div>
    <h1 style="font-size:1.5rem;font-weight:800;margin:0 0 12px;">Destination not found</h1>
    <p style="color:#8A9BC4;margin:0 0 24px;">We don't have a budget guide for that destination yet.</p>
    <a href="/" style="display:inline-block;background:#00D4FF;color:#0A0F1E;padding:10px 24px;border-radius:10px;font-weight:800;text-decoration:none;">Back to calculator</a>
  </div>
</body>
</html>`;
}
