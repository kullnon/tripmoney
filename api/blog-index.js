// api/blog-index.js — server-rendered /blog index page (good for SEO crawling)
// Routed via vercel.json rewrite: /blog -> /api/blog-index
import { getServiceClient } from '../lib/supabase.js';

const SITE = 'https://www.mytripmoney.com';

export default async function handler(req, res) {
  try {
    const supabase = getServiceClient();
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('slug, title, excerpt, category, author_slug, published_at, tags')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(50);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
    return res.status(200).send(renderIndex(posts || []));
  } catch (e) {
    console.error('blog-index error:', e);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(500).send(renderIndex([]));
  }
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function fmtDate(d) {
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

function renderIndex(posts) {
  const cards = posts
    .map(
      (p) => `
      <a href="/blog/${esc(p.slug)}" class="card">
        ${p.category ? `<div class="badge">${esc(p.category)}</div>` : ''}
        <h2 class="card-title">${esc(p.title)}</h2>
        ${p.excerpt ? `<p class="card-excerpt">${esc(p.excerpt)}</p>` : ''}
        <div class="card-meta">${fmtDate(p.published_at)} · Marcus Chen</div>
      </a>`
    )
    .join('\n');

  const ldJson = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'MyTripMoney Blog',
    url: `${SITE}/blog`,
    description: 'Travel-budget and multi-currency intel from Marcus Chen.',
    blogPost: posts.slice(0, 20).map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      url: `${SITE}/blog/${p.slug}`,
      datePublished: p.published_at,
      author: { '@type': 'Person', name: 'Marcus Chen' },
    })),
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Blog — MyTripMoney</title>
  <meta name="description" content="Travel budgeting, multi-currency tips, and honest takes on expense apps from Marcus Chen, MyTripMoney's Travel Finance Editor.">
  <link rel="canonical" href="${SITE}/blog">
  <meta property="og:title" content="MyTripMoney Blog">
  <meta property="og:description" content="Travel budgeting, multi-currency tips, and honest takes on expense apps.">
  <meta property="og:url" content="${SITE}/blog">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" type="image/png" href="/favicon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=Sora:wght@600;700;800&display=swap" rel="stylesheet">
  <script type="application/ld+json">${JSON.stringify(ldJson)}</script>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body { background:#0A0F1E; color:#F0F4FF; font-family:'DM Sans',-apple-system,sans-serif; }
    a { color:inherit; text-decoration:none; }
    .nav { position:sticky; top:0; z-index:10; background:rgba(10,15,30,0.92); backdrop-filter:blur(16px); border-bottom:1px solid #1E2D45; padding:16px 0; }
    .container { max-width:1100px; margin:0 auto; padding:0 24px; }
    .nav-row { display:flex; justify-content:space-between; align-items:center; }
    .logo { font-family:Sora,sans-serif; font-weight:800; font-size:20px; }
    .logo .accent { color:#00D4FF; }
    .nav-links { display:flex; gap:24px; align-items:center; }
    .nav-link { color:#8A9BC4; font-size:14px; font-weight:600; }
    .btn { background:#00D4FF; color:#0A0F1E; border:none; border-radius:10px; padding:10px 20px; font-size:14px; font-weight:800; cursor:pointer; }
    .hero { padding:80px 0 40px; text-align:center; }
    .hero h1 { font-family:Sora,sans-serif; font-size:clamp(36px,5vw,52px); font-weight:900; letter-spacing:-1.5px; margin-bottom:16px; }
    .hero p { color:#8A9BC4; font-size:18px; max-width:560px; margin:0 auto; line-height:1.6; }
    .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:20px; padding:40px 0 80px; }
    .card { background:#1A2235; border:1px solid #1E2D45; border-radius:16px; padding:24px; transition:all 0.2s; display:block; }
    .card:hover { transform:translateY(-2px); border-color:#00D4FF44; box-shadow:0 12px 40px rgba(0,212,255,0.08); }
    .badge { display:inline-block; background:#00D4FF22; color:#00D4FF; font-size:11px; font-weight:700; padding:4px 10px; border-radius:99px; margin-bottom:12px; text-transform:uppercase; letter-spacing:0.5px; }
    .card-title { font-family:Sora,sans-serif; font-size:20px; font-weight:700; line-height:1.3; margin-bottom:10px; }
    .card-excerpt { color:#8A9BC4; font-size:14px; line-height:1.55; margin-bottom:14px; }
    .card-meta { color:#4A5880; font-size:12px; font-weight:600; }
    .empty { text-align:center; padding:60px 0; color:#8A9BC4; }
    .footer { border-top:1px solid #1E2D45; padding:40px 0; text-align:center; color:#4A5880; font-size:13px; }
  </style>
</head>
<body>
  <nav class="nav">
    <div class="container nav-row">
      <a href="/" class="logo"><span>My</span><span class="accent">Trip</span><span>Money</span></a>
      <div class="nav-links">
        <a href="/#pricing" class="nav-link">Pricing</a>
        <a href="/blog" class="nav-link" style="color:#F0F4FF;">Blog</a>
        <a href="/auth?next=/app" class="btn">Get Started</a>
      </div>
    </div>
  </nav>
  <header class="hero">
    <div class="container">
      <h1>Travel money, decoded.</h1>
      <p>Honest takes on travel budgeting, multi-currency spending, and the apps that actually keep up with real-world trips. Written by Marcus Chen.</p>
    </div>
  </header>
  <main class="container">
    ${posts.length === 0 ? '<div class="empty">No posts yet. Check back soon.</div>' : `<div class="grid">${cards}</div>`}
  </main>
  <footer class="footer">
    <div class="container">© 2026 MyTripMoney · <a href="/" style="color:#8A9BC4;">Home</a> · <a href="/#pricing" style="color:#8A9BC4;">Pricing</a></div>
  </footer>
</body>
</html>`;
}
