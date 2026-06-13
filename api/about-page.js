// api/about-page.js — server-rendered /about/marcus-chen author byline page
//
// Routed via vercel.json:
//   /about/marcus-chen -> /api/about-page
//
// Mirrors api/guide-page.js: returns a complete HTML document with inline
// styles, JSON-LD (Person + BreadcrumbList), OG/Twitter cards. Same dark-theme
// design tokens and shared head/nav/footer so it matches the SSR content pages.
// SSR bylines (api/guide-page.js, api/trip-page.js, api/blog-post.js) link here.

import { getAuthor } from '../lib/authors.js';

const SITE = 'https://www.mytripmoney.com';

export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  // Static evergreen content — cache aggressively at the edge.
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800');
  return res.status(200).send(renderMarcusChen());
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function sharedHead({ title, description, url, jsonLd, ogType = 'profile' }) {
  const ldBlocks = jsonLd.map((ld) => `<script type="application/ld+json">${JSON.stringify(ld)}</script>`).join('\n  ');
  return `<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${url}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:type" content="${esc(ogType)}">
  <meta property="og:site_name" content="MyTripMoney">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <link rel="icon" type="image/png" href="/favicon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=Sora:wght@600;700;800;900&display=swap" rel="stylesheet">
  ${ldBlocks}
  <style>${sharedCSS()}</style>
</head>`;
}

function sharedCSS() {
  return `
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
    .by-role { color:#8A9BC4; font-size:14px; font-weight:600; margin-bottom:28px; padding-bottom:24px; border-bottom:1px solid #1E2D45; }
    .intro p { color:#cbd5e1; font-size:17px; line-height:1.75; margin-bottom:18px; }
    .estimator-cta { background:#111827; border:2px solid #00D4FF44; border-radius:20px; padding:28px; text-align:center; margin:40px 0; }
    .estimator-cta h3 { font-family:Sora,sans-serif; color:#F0F4FF; font-size:22px; font-weight:800; margin-bottom:10px; letter-spacing:-0.4px; }
    .estimator-cta p { color:#8A9BC4; font-size:14px; margin-bottom:18px; }
    .footer { border-top:1px solid #1E2D45; padding:36px 0; text-align:center; color:#4A5880; font-size:13px; margin-top:60px; }
    .footer a { color:#8A9BC4; text-decoration:none; }
    .footer a:hover { color:#00D4FF; }
    @media (max-width:600px) {
      .nav-links { gap:14px; }
      .nav-link { font-size:13px; }
      .nav .btn { display:none; }
    }
  `;
}

function navHTML() {
  return `<nav class="nav">
    <div class="container nav-row">
      <a href="/" class="logo"><span>My</span><span class="accent">Trip</span><span>Money</span></a>
      <div class="nav-links">
        <a href="/guides" class="nav-link">Guides</a>
        <a href="/#pricing" class="nav-link">Pricing</a>
        <a href="https://blog.mytripmoney.com" class="nav-link">Blog</a>
        <a href="/auth?next=/app" class="btn">Get Started</a>
      </div>
    </div>
  </nav>`;
}

function footerHTML() {
  return `<footer class="footer">
    <div class="container">© 2026 MyTripMoney · <a href="/">Budget calculator</a> · <a href="/guides">Guides</a> · <a href="/#pricing">Pricing</a> · <a href="https://blog.mytripmoney.com">Blog</a></div>
  </footer>`;
}

function renderMarcusChen() {
  const author = getAuthor('marcus-chen');
  const url = `${SITE}/about/marcus-chen`;
  const title = 'Marcus Chen — Travel Finance Editor | MyTripMoney';
  const description = 'Travel finance editor at MyTripMoney covering destination cost breakdowns, currency-aware budgeting, and practical trip-cost planning across 40+ destinations.';

  // Person JSON-LD. jobTitle matches the site-wide author role in lib/authors.js.
  // No sameAs/social links (none exist).
  const personLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Marcus Chen',
    jobTitle: 'Travel Finance Editor',
    description: 'Travel finance editor at MyTripMoney covering destination cost breakdowns, currency-aware budgeting, and practical trip-cost planning across 40+ destinations.',
    url: `${SITE}/about/marcus-chen`,
    worksFor: { '@type': 'Organization', name: 'MyTripMoney', url: SITE },
    knowsAbout: ['Travel budgeting', 'Trip cost estimation', 'Currency conversion', 'Budget travel planning'],
  };

  // BreadcrumbList — same shape the other SSR pages use (api/guide-page.js).
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' },
      { '@type': 'ListItem', position: 2, name: 'About', item: SITE + '/about' },
      { '@type': 'ListItem', position: 3, name: 'Marcus Chen', item: url },
    ],
  };

  const bodyParas = [
    "Marcus covers the one question every trip starts with: what's this going to cost? He researches and writes MyTripMoney's destination cost breakdowns and budgeting guides — flights, lodging, food, local transport, and the hidden line items most planners miss — turning vague trip ideas into real numbers across 40+ destinations.",
    'His focus is practical, cost-first travel planning: currency-aware budgeting, value-per-day comparisons between cities, and helping both first-time and frequent travelers avoid overspending. Every guide is built to answer "can I afford this trip, and where does the money actually go?"',
  ];
  const introHtml = bodyParas.map((p) => `<p>${esc(p)}</p>`).join('\n        ');

  return `<!DOCTYPE html>
<html lang="en">
${sharedHead({ title, description, url, jsonLd: [personLd, breadcrumbLd] })}
<body>
  ${navHTML()}
  <main>
    <div class="container">
      <div class="crumbs"><a href="/">Home</a> › About › Marcus Chen</div>
      <h1 class="page-title">Marcus Chen — Travel Finance Editor, MyTripMoney</h1>
      <div class="by-role">${esc(author.role)}</div>

      <div class="intro">
        ${introHtml}
      </div>

      <div class="estimator-cta">
        <h3>Planning a trip?</h3>
        <p>Estimate your full budget — flights, hotels, food, transport, activities — free, no signup needed.</p>
        <a class="btn btn-lg" href="/">Estimate your full budget free →</a>
      </div>
    </div>
  </main>
  ${footerHTML()}
</body>
</html>`;
}
