// api/guide-page.js — server-rendered /guides and /guides/[slug] pages
//
// Routed via vercel.json:
//   /guides          -> /api/guide-page          (index of all guides)
//   /guides/:slug    -> /api/guide-page?slug=:slug (individual guide)
//
// Mirrors api/trip-page.js: returns a complete HTML document with inline
// styles, JSON-LD (Article + FAQPage + BreadcrumbList), OG/Twitter cards.
// Same dark-theme design tokens so guides match the destination pages.

import { guides, guideSlugs, getGuide, relatedGuides } from '../lib/guides.js';
import { getAuthor } from '../lib/authors.js';

const SITE = 'https://mytripmoney.com';

export default function handler(req, res) {
  const rawSlug = (req.query?.slug || '').toString().toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 60);

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  // Static evergreen content — cache aggressively at the edge.
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800');

  if (!rawSlug) {
    return res.status(200).send(renderIndex());
  }

  const guide = getGuide(rawSlug);
  if (!guide) {
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    return res.status(404).send(renderNotFound());
  }

  return res.status(200).send(renderGuide(guide));
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function sharedHead({ title, description, url, jsonLd, ogType = 'article' }) {
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
    .byline { display:flex; gap:12px; align-items:center; margin-bottom:24px; padding-bottom:20px; border-bottom:1px solid #1E2D45; }
    .by-name { font-weight:700; color:#F0F4FF; font-size:14px; }
    .by-name a { color:#00D4FF; text-decoration:none; }
    .by-role { color:#8A9BC4; font-size:12px; }
    .by-updated { color:#4A5880; font-size:13px; margin-left:auto; }
    .intro p { color:#cbd5e1; font-size:17px; line-height:1.75; margin-bottom:16px; }
    .section { margin-top:36px; }
    .section h2 { font-family:Sora,sans-serif; color:#F0F4FF; font-size:24px; font-weight:800; margin-bottom:14px; letter-spacing:-0.4px; line-height:1.25; }
    .section p { color:#cbd5e1; font-size:16px; line-height:1.75; margin-bottom:14px; }
    .estimator-cta { background:#111827; border:2px solid #00D4FF44; border-radius:20px; padding:28px; text-align:center; margin:40px 0; }
    .estimator-cta h3 { font-family:Sora,sans-serif; color:#F0F4FF; font-size:22px; font-weight:800; margin-bottom:10px; letter-spacing:-0.4px; }
    .estimator-cta p { color:#8A9BC4; font-size:14px; margin-bottom:18px; }
    .faq-block-title { font-family:Sora,sans-serif; color:#F0F4FF; font-size:24px; font-weight:800; margin:48px 0 8px; letter-spacing:-0.4px; }
    .faq { margin-top:8px; }
    .faq-item { padding:18px 0; border-bottom:1px solid #1E2D45; }
    .faq-q { font-family:Sora,sans-serif; font-size:17px; font-weight:700; color:#F0F4FF; margin-bottom:8px; line-height:1.4; }
    .faq-a { color:#cbd5e1; font-size:15px; line-height:1.7; }
    .related { margin-top:48px; padding-top:32px; border-top:1px solid #1E2D45; }
    .related-title { font-family:Sora,sans-serif; color:#F0F4FF; font-size:20px; font-weight:800; margin-bottom:16px; letter-spacing:-0.3px; }
    .related-list { display:grid; gap:12px; }
    .related-card { display:block; background:#1A2235; border:1px solid #1E2D45; border-radius:12px; padding:14px 16px; text-decoration:none; transition:border-color .15s; }
    .related-card:hover { border-color:#00D4FF66; }
    .related-card-title { color:#F0F4FF; font-weight:700; font-size:15px; margin-bottom:4px; }
    .related-card-desc { color:#8A9BC4; font-size:13px; line-height:1.5; }
    .index-hero { padding:8px 0 36px; border-bottom:1px solid #1E2D45; margin-bottom:32px; }
    .index-sub { color:#8A9BC4; font-size:16px; line-height:1.7; margin-top:12px; max-width:640px; }
    .guides-grid { display:grid; gap:14px; }
    .guide-card { display:block; background:#1A2235; border:1px solid #1E2D45; border-radius:16px; padding:22px 24px; text-decoration:none; transition:border-color .15s, transform .15s; }
    .guide-card:hover { border-color:#00D4FF66; transform:translateY(-1px); }
    .guide-card-title { font-family:Sora,sans-serif; color:#F0F4FF; font-weight:800; font-size:19px; margin-bottom:8px; letter-spacing:-0.3px; line-height:1.3; }
    .guide-card-desc { color:#cbd5e1; font-size:14px; line-height:1.6; }
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

function renderGuide(guide) {
  const author = getAuthor('marcus-chen');
  const url = `${SITE}/guides/${guide.slug}`;
  const lastUpdated = todayISO();

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.h1,
    description: guide.metaDescription,
    author: {
      '@type': 'Person',
      name: author.name,
      url: `${SITE}/about/marcus-chen`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'MyTripMoney',
      logo: { '@type': 'ImageObject', url: `${SITE}/pwa-512x512.png` },
    },
    datePublished: lastUpdated,
    dateModified: lastUpdated,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: guide.faqs.map((f) => ({
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
      { '@type': 'ListItem', position: 2, name: 'Guides', item: SITE + '/guides' },
      { '@type': 'ListItem', position: 3, name: guide.h1, item: url },
    ],
  };

  const introHtml = guide.intro.map((p) => `<p>${esc(p)}</p>`).join('\n        ');

  const faqHtml = guide.faqs.map((f) => `
        <div class="faq-item">
          <h3 class="faq-q">${esc(f.question)}</h3>
          <p class="faq-a">${esc(f.answer)}</p>
        </div>`).join('');

  const related = relatedGuides(guide.slug);
  const relatedHtml = related.map((g) => `
        <a class="related-card" href="/guides/${esc(g.slug)}">
          <div class="related-card-title">${esc(g.title)}</div>
          <div class="related-card-desc">${esc(g.metaDescription)}</div>
        </a>`).join('');

  // CTA box placed mid-page: after the first ~3 sections, before the rest.
  // Splitting here gives the user something useful around the natural reading
  // pause without breaking up the dense first-half content.
  const splitAt = Math.min(3, Math.max(1, Math.floor(guide.sections.length / 2)));
  const sectionsTop = guide.sections.slice(0, splitAt).map(renderSection).join('\n      ');
  const sectionsBottom = guide.sections.slice(splitAt).map(renderSection).join('\n      ');

  return `<!DOCTYPE html>
<html lang="en">
${sharedHead({ title: guide.metaTitle, description: guide.metaDescription, url, jsonLd: [articleLd, faqLd, breadcrumbLd] })}
<body>
  ${navHTML()}
  <main>
    <div class="container">
      <div class="crumbs"><a href="/guides">← All guides</a></div>
      <h1 class="page-title">${esc(guide.h1)}</h1>
      <div class="byline">
        <div>
          <div class="by-name">By <a href="/about/marcus-chen">${esc(author.name)}</a>, Senior Editor</div>
          <div class="by-role">${esc(author.role)}</div>
        </div>
        <div class="by-updated">Last updated: ${lastUpdated}</div>
      </div>

      <div class="intro">
        ${introHtml}
      </div>

      ${sectionsTop}

      <div class="estimator-cta">
        <h3>Planning a trip?</h3>
        <p>Estimate your full budget — flights, hotels, food, transport, activities — free, no signup needed.</p>
        <a class="btn btn-lg" href="/">Estimate your full budget free →</a>
      </div>

      ${sectionsBottom}

      <h2 class="faq-block-title">Frequently asked questions</h2>
      <div class="faq">${faqHtml}
      </div>

      <div class="related">
        <div class="related-title">Related guides</div>
        <div class="related-list">${relatedHtml}
        </div>
      </div>
    </div>
  </main>
  ${footerHTML()}
</body>
</html>`;
}

function renderSection(sec) {
  const body = sec.body.map((p) => `<p>${esc(p)}</p>`).join('\n          ');
  return `<section class="section">
        <h2>${esc(sec.heading)}</h2>
        ${body}
      </section>`;
}

function renderIndex() {
  const url = `${SITE}/guides`;
  const title = 'Travel Money Guides for 2026 | MyTripMoney';
  const description = 'Evergreen guides on travel cards, multi-currency accounts, ATM fees, currency conversion scams, and how to handle money abroad in 2026.';

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: url },
    ],
  };

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: guideSlugs.map((slug, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE}/guides/${slug}`,
      name: guides[slug].title,
    })),
  };

  const cardsHtml = guideSlugs.map((slug) => {
    const g = guides[slug];
    return `<a class="guide-card" href="/guides/${esc(slug)}">
        <div class="guide-card-title">${esc(g.title)}</div>
        <div class="guide-card-desc">${esc(g.metaDescription)}</div>
      </a>`;
  }).join('\n      ');

  return `<!DOCTYPE html>
<html lang="en">
${sharedHead({ title, description, url, jsonLd: [breadcrumbLd, itemListLd], ogType: 'website' })}
<body>
  ${navHTML()}
  <main>
    <div class="container">
      <div class="crumbs"><a href="/">← Home</a></div>
      <div class="index-hero">
        <h1 class="page-title">Travel money guides for 2026</h1>
        <p class="index-sub">Plain-English guides on travel cards, multi-currency accounts, ATM fees, and the small decisions that quietly add up to hundreds of dollars over a trip.</p>
      </div>
      <div class="guides-grid">
        ${cardsHtml}
      </div>
    </div>
  </main>
  ${footerHTML()}
</body>
</html>`;
}

function renderNotFound() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Guide not found — MyTripMoney</title>
  <meta name="robots" content="noindex">
</head>
<body style="margin:0;background:#0A0F1E;color:#F0F4FF;font-family:system-ui,-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;">
  <div style="text-align:center;padding:24px;">
    <div style="font-size:3rem;margin-bottom:12px;">📘</div>
    <h1 style="font-size:1.5rem;font-weight:800;margin:0 0 12px;">Guide not found</h1>
    <p style="color:#8A9BC4;margin:0 0 24px;">We don't have that guide. Browse the full list:</p>
    <a href="/guides" style="display:inline-block;background:#00D4FF;color:#0A0F1E;padding:10px 24px;border-radius:10px;font-weight:800;text-decoration:none;">All guides</a>
  </div>
</body>
</html>`;
}
