import { useState, useEffect } from "react";
import Estimator from "./components/Estimator.jsx";
import FAQSection from "./components/FAQSection.jsx";
import SiteHeader from "./components/SiteHeader.jsx";
import {
  destinationCosts, POPULAR_SLUGS,
  ORIGINS, ORIGIN_CODES, DEFAULT_ORIGIN, flightEstimateFor,
} from "../lib/destinationCosts.js";

const ESTIMATOR_FAQS = [
  {
    question: "How accurate are MyTripMoney's travel budget estimates?",
    answer: "Our estimates are based on 2026 average traveler spending data across accommodation, food, local transport, and activities for each destination. Budget tier reflects hostels, street food, and public transit. Mid-range reflects 3-star hotels, restaurant meals, and a mix of taxis and transit. Luxury reflects 4 to 5-star hotels, fine dining, and private transport. Actual costs vary by season, exchange rates, and personal style — most travelers come within 15 to 20 percent of the estimate.",
  },
  {
    question: "Is the budget calculator free to use?",
    answer: "Yes. The MyTripMoney budget calculator is completely free, no signup required. You can estimate trip costs for 40+ destinations instantly. Creating an account is only needed if you want to save your trip and track actual spending against your budget during travel.",
  },
  {
    question: "How much does a one-week vacation cost on average?",
    answer: "For a single traveler, a one-week vacation in 2026 typically costs between $700 and $1,400 in Southeast Asia (Bangkok, Bali, Hanoi), $1,500 to $2,800 in Latin America (Mexico City, Cartagena, Cusco), $2,200 to $3,800 in Western Europe (Paris, Rome, Barcelona), and $3,000 to $5,500 in expensive destinations (Tokyo, Reykjavik, Dubai). These ranges cover mid-range travel and exclude international flights.",
  },
  {
    question: "What does the estimate include?",
    answer: "The estimate includes daily accommodation, food, local transport (taxis, metro, buses, ride-shares), and typical tourist activities. A rough international flight estimate is shown separately. The estimate does not include travel insurance, visas, shopping, alcohol-heavy nightlife, or once-in-a-lifetime experiences like hot air balloons or private tours — budget an extra 10 to 20 percent for these.",
  },
  {
    question: "How can I lower my travel budget without sacrificing the experience?",
    answer: "Three changes cut most trip budgets by 20 to 30 percent: stay in apartments or boutique guesthouses instead of hotels, eat one restaurant meal per day instead of three, and use public transport plus walking instead of taxis. Booking flights 6 to 8 weeks in advance and traveling in shoulder season (April to May, September to October for most destinations) cuts another 15 to 25 percent.",
  },
  {
    question: "Can I track my actual spending against the budget?",
    answer: "Yes. After estimating your trip, you can save it to your MyTripMoney account and log expenses as you travel. The app shows your live spending versus the planned budget by category, so you can see whether you are on track, under, or over for accommodation, food, transport, and activities.",
  },
  {
    question: "Does the calculator account for currency exchange rates?",
    answer: "Yes. All cost data is sourced in USD and converted live to your home currency using mid-market exchange rates updated every 60 seconds. Note that the rate you actually receive at ATMs and on card transactions abroad is typically 1 to 3 percent worse than the mid-market rate — factor a small FX buffer into your real-world budget.",
  },
];

const T = {
  bg: "#0A0F1E", surface: "#111827", card: "#1A2235",
  border: "#1E2D45", accent: "#00D4FF", green: "#00E5A0",
  orange: "#FF8A00", red: "#FF4560", purple: "#7B61FF", yellow: "#FFD600",
  text: "#F0F4FF", textMid: "#8A9BC4", textDim: "#4A5880",
};

export default function LandingPage({ onGetStarted, onLogin, onInstall, onGoPro, canInstall, isInstalled, isIOS, isAndroid, triggerInstall }) {
  const [annual, setAnnual] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const [installing, setInstalling] = useState(false);

  // Origin state lifted up so the Estimator AND the popular-trips grid share
  // it: changing origin in the estimator should refresh the card totals.
  // Same localStorage key the Estimator was previously reading directly.
  const [origin, setOrigin] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_ORIGIN;
    try {
      const stored = localStorage.getItem("tripOrigin");
      if (stored && ORIGIN_CODES.includes(stored)) return stored;
    } catch { /* ignore */ }
    return DEFAULT_ORIGIN;
  });
  const handleOriginChange = (next) => {
    setOrigin(next);
    try { localStorage.setItem("tripOrigin", next); } catch { /* ignore */ }
  };

  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const handleInstallClick = async () => {
    if (canInstall && triggerInstall) {
      setInstalling(true);
      await triggerInstall();
      setInstalling(false);
    } else if (onInstall) {
      onInstall();
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    { icon: "🗺️", title: "Multi-Leg Trips", desc: "Track USA → Cuba → France → Home. Each leg gets its own budget, currency, and timeline." },
    { icon: "🌍", title: "100+ Currencies", desc: "Cuban Pesos, Euros, Yen — log expenses in any currency. Auto-converts to your base." },
    { icon: "📊", title: "Smart Reports", desc: "Budget health score, daily spend charts, category breakdowns. Know exactly where your money goes." },
    { icon: "📧", title: "Email & PDF Reports", desc: "Send polished reports via Gmail, Outlook, or download as PDF. Share with travel partners." },
    { icon: "⚡", title: "3-Tap Quick Add", desc: "Standing in line at a restaurant? Category → Amount → Save. Under 5 seconds." },
    { icon: "📴", title: "Works Offline", desc: "No WiFi in the jungle? No problem. Everything syncs when you're back online." },
  ];

  const comparisons = [
    { feature: "Multi-leg trip support", us: true, them: false },
    { feature: "100+ currencies", us: true, them: false },
    { feature: "Per-leg budgets", us: true, them: false },
    { feature: "Email reports (Gmail/Outlook)", us: true, them: false },
    { feature: "Trip health score (A-F)", us: true, them: false },
    { feature: "Works offline", us: true, them: true },
    { feature: "No account required to start", us: true, them: false },
    { feature: "Budget tracking", us: true, them: true },
    { feature: "Category breakdown", us: true, them: true },
  ];

  const testimonials = [
    { name: "Sarah K.", trip: "Bali & Thailand", quote: "I tracked 3 currencies across 2 countries without thinking. The multi-leg feature is genius." },
    { name: "Marcus D.", trip: "Caribbean Cruise", quote: "Used to lose track of spending by day 3. Now I know exactly where I stand, every single day." },
    { name: "Priya & James", trip: "Europe Honeymoon", quote: "We split a 4-country trip with separate budgets per stop. Nothing else lets you do that." },
  ];

  const Section = ({ children, style = {} }) => (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", ...style }}>{children}</div>
  );

  return (
    <div style={{ fontFamily: "'DM Sans', -apple-system, sans-serif", background: T.bg, color: T.text, overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=Sora:wght@400;600;700;800&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { background: ${T.bg}; }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 20px ${T.accent}33; } 50% { box-shadow: 0 0 40px ${T.accent}66; } }
        .fade-up { animation: fadeUp 0.8s ease both; }
        .fade-up-1 { animation-delay: 0.1s; }
        .fade-up-2 { animation-delay: 0.2s; }
        .fade-up-3 { animation-delay: 0.3s; }
        .fade-up-4 { animation-delay: 0.4s; }
        .cta-btn { transition: all 0.2s; }
        .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 40px ${T.accent}44; }
      
.nav-pricing { display: inline; }
.nav-links { gap: 12px; }
@media (max-width: 600px) { .nav-pricing { font-size: 13px; padding: 6px 4px; } .nav-cta { display: none !important; } .nav-links { gap: 6px; } }

.popular-origin-row { display: inline-flex; align-items: center; gap: 12px; padding: 10px 16px; border-radius: 14px; background: ${T.card}; border: 1px solid ${T.border}; transition: border-color 0.15s; }
.popular-origin-row:focus-within { border-color: ${T.accent}; }
.popular-origin-row label { color: ${T.textMid}; font-size: 14px; font-weight: 600; white-space: nowrap; }
.popular-origin-row select { background: transparent; border: none; color: ${T.text}; font-size: 16px; font-weight: 700; font-family: inherit; padding: 4px 24px 4px 4px; cursor: pointer; outline: none; -webkit-appearance: none; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2300D4FF' d='M6 8L1 3h10z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 4px center; }
.popular-origin-row select:hover { color: ${T.accent}; }
@media (max-width: 600px) { .popular-origin-row { flex-direction: column; align-items: stretch; gap: 4px; padding: 12px 16px; } .popular-origin-row label { text-align: center; } .popular-origin-row select { text-align: center; padding-right: 4px; background-position: right center; } }
`}</style>

      {/* ─── NAV ─── */}
      <SiteHeader scrollY={scrollY} onGetStarted={onGetStarted} />

      {/* ─── HERO (estimator) ─── */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden", paddingTop: 100, paddingBottom: 60 }}>
        <div style={{ position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)", width: 700, height: 700, background: `radial-gradient(circle, ${T.accent}15 0%, transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "50%", right: "5%", width: 320, height: 320, background: `radial-gradient(circle, ${T.purple}10 0%, transparent 70%)`, pointerEvents: "none" }} />

        <Section>
          <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto 36px" }}>
            <div className="fade-up" style={{ display: "inline-block", background: T.accent + "15", border: `1px solid ${T.accent}33`, borderRadius: 99, padding: "6px 16px", marginBottom: 24 }}>
              <span style={{ color: T.accent, fontSize: 13, fontWeight: 700 }}>✨ Free · 40+ destinations · No signup</span>
            </div>
            <h1 className="fade-up fade-up-1" style={{ fontFamily: "Sora", fontSize: "clamp(34px, 5.5vw, 60px)", fontWeight: 900, lineHeight: 1.05, letterSpacing: -2, marginBottom: 18, color: T.text }}>
              Plan your trip budget in <span style={{ color: T.accent }}>30 seconds.</span>
            </h1>
            <p className="fade-up fade-up-2" style={{ color: T.textMid, fontSize: 18, lineHeight: 1.55, maxWidth: 580, margin: "0 auto" }}>
              Get a realistic cost estimate for any destination — then track your actual spending as you travel.
            </p>
          </div>

          <div className="fade-up fade-up-3">
            <Estimator preselectSlug="paris" origin={origin} onOriginChange={handleOriginChange} />
          </div>
        </Section>
      </section>

      {/* ─── EXPLAINER (3 paragraphs, GEO-friendly) ─── */}
      <section style={{ padding: "70px 0", borderTop: `1px solid ${T.border}` }}>
        <Section>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <h2 style={{ fontFamily: "Sora", fontSize: "clamp(24px, 3.5vw, 34px)", fontWeight: 900, letterSpacing: -0.8, marginBottom: 24, color: T.text, textAlign: "center" }}>
              How the MyTripMoney estimator works
            </h2>
            <div style={{ color: T.textMid, fontSize: 16, lineHeight: 1.75, display: "flex", flexDirection: "column", gap: 18 }}>
              <p>
                The MyTripMoney travel budget calculator is a free tool that estimates the total cost of a trip across 40+ popular destinations worldwide — no signup required. Pick where you're going, how long you're staying, your travel style, and the number of travelers, and you get an instant breakdown of accommodation, food, local transport, and activity costs in your home currency.
              </p>
              <p>
                All cost data is updated for <strong style={{ color: T.text }}>2026</strong> and grounded in real traveler spending averages from sources like Budget Your Trip and Numbeo. The estimator covers three travel styles — budget (hostels and street food), mid-range (3-star hotels and restaurant meals), and luxury (4–5 star hotels and fine dining) — so the number you see reflects how <em>you</em> actually travel, not a generic average. We convert costs to your home currency live using mid-market exchange rates from exchangerate.host.
              </p>
              <p>
                Once you have a number you trust, save the trip and switch to tracking mode: log every expense as you spend, watch your live total against the budget by category, and know exactly when you're about to blow past your accommodation or food allowance. The estimator and the tracker are the same product — one front door for planning, one for executing.
              </p>
            </div>
          </div>
        </Section>
      </section>

      {/* ─── POPULAR TRIP ESTIMATES (link grid for GEO/SEO) ─── */}
      <section style={{ padding: "60px 0 100px", background: T.surface, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
        <Section>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <h2 style={{ fontFamily: "Sora", fontSize: "clamp(24px, 3.5vw, 34px)", fontWeight: 900, letterSpacing: -0.8, color: T.text, marginBottom: 10 }}>
              Popular trip estimates
            </h2>
            <p style={{ color: T.textMid, fontSize: 15 }}>
              Tap a destination for a 2026 budget guide and pre-filled estimator.
            </p>
          </div>
          {/* Origin selector — shares `origin` state with the estimator (lifted
              in this file), so changing either updates both + the card totals. */}
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div className="popular-origin-row">
              <label htmlFor="popular-origin">Showing prices from</label>
              <select
                id="popular-origin"
                value={origin}
                onChange={(e) => handleOriginChange(e.target.value)}
              >
                {ORIGINS.map((o) => (
                  <option key={o.code} value={o.code}>{o.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, maxWidth: 980, margin: "0 auto" }}>
            {POPULAR_SLUGS.map((slug) => {
              const d = destinationCosts[slug];
              if (!d) return null;
              const tier = d.midRange;
              const dailyUsd = tier.accommodation + tier.food + tier.transport + tier.activities;
              const weekUsd = dailyUsd * 7;
              // Per-card total now includes the flight from the user's selected
              // origin — same math as the main estimator's grand total at
              // 7 days, 1 traveler, mid-range.
              const flightUsd = flightEstimateFor(slug, origin);
              const totalUsd = weekUsd + flightUsd;
              return (
                <a key={slug} href={`/trip/${slug}`} style={{
                  display: "block",
                  background: T.card,
                  border: `1px solid ${T.border}`,
                  borderRadius: 16,
                  padding: "18px 18px 16px",
                  textDecoration: "none",
                  color: T.text,
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.accent + "66"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 4 }}>{d.name}</div>
                  <div style={{ color: T.textMid, fontSize: 12, marginBottom: 10 }}>{d.country}</div>
                  <div style={{ color: T.accent, fontSize: 14, fontWeight: 700 }}>
                    ~${Math.round(totalUsd).toLocaleString()}<span style={{ color: T.textDim, fontWeight: 500 }}> total · incl. flight</span>
                  </div>
                </a>
              );
            })}
          </div>
        </Section>
      </section>

      {/* ─── INSTALL SECTION ─── */}
      {!isInstalled && (
        <section style={{ padding: "50px 0", borderTop: `1px solid ${T.border}` }}>
          <Section>
            <div style={{
              background: `linear-gradient(135deg, ${T.accent}18, ${T.purple}18)`,
              border: `2px solid ${T.accent}44`,
              borderRadius: 24,
              padding: "32px 24px",
              textAlign: "center",
              maxWidth: 640,
              margin: "0 auto",
              position: "relative",
              overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, background: `radial-gradient(circle, ${T.accent}22 0%, transparent 70%)`, pointerEvents: "none" }} />

              <img src="/pwa-192x192.png" alt="" style={{ width: 72, height: 72, marginBottom: 16, position: "relative" }} onError={e => e.target.style.display = "none"} />

              <div style={{ display: "inline-block", background: T.accent + "22", color: T.accent, fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 99, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>
                📲 Install the App
              </div>

              <h3 style={{ fontFamily: "Sora", fontSize: "clamp(22px, 3.5vw, 30px)", fontWeight: 900, color: T.text, marginBottom: 10, letterSpacing: -0.5 }}>
                Install MyTripMoney on your homepage
              </h3>
              <p style={{ color: T.textMid, fontSize: 15, marginBottom: 24, maxWidth: 440, margin: "0 auto 24px", lineHeight: 1.6 }}>
                Add it to your home screen like a real app — no app store needed. Works offline and syncs when you're back online.
              </p>

              {/* Android with native install API */}
              {canInstall && (
                <button onClick={handleInstallClick} disabled={installing} className="cta-btn" style={{
                  background: T.accent, color: T.bg, border: "none", borderRadius: 14,
                  padding: "16px 36px", fontSize: 17, fontWeight: 900,
                  cursor: installing ? "not-allowed" : "pointer",
                  display: "inline-flex", alignItems: "center", gap: 10,
                }}>
                  {installing ? "Installing..." : "📲 Install Now"}
                </button>
              )}

              {/* iPhone / iPad instructions */}
              {!canInstall && isIOS && (
                <div style={{ background: T.bg, borderRadius: 16, padding: 20, textAlign: "left", maxWidth: 400, margin: "0 auto" }}>
                  <div style={{ color: T.accent, fontSize: 13, fontWeight: 700, marginBottom: 14, textAlign: "center" }}>📱 On iPhone / iPad Safari</div>
                  {[
                    ["1", <>Tap the <strong>Share button</strong> <span style={{ color: T.accent }}>⬆️</span> at the bottom</>],
                    ["2", <>Scroll down and tap <strong>"Add to Home Screen"</strong></>],
                    ["3", <>Tap <strong>"Add"</strong> in the top-right</>],
                  ].map(([n, txt], i) => (
                    <div key={n} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: i < 2 ? 12 : 0 }}>
                      <div style={{ minWidth: 26, height: 26, borderRadius: "50%", background: T.accent + "22", color: T.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800 }}>{n}</div>
                      <div style={{ color: T.text, fontSize: 14, lineHeight: 1.6 }}>{txt}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Android Chrome fallback (no native prompt available) */}
              {!canInstall && !isIOS && isMobile && (
                <div style={{ background: T.bg, borderRadius: 16, padding: 20, textAlign: "left", maxWidth: 400, margin: "0 auto" }}>
                  <div style={{ color: T.accent, fontSize: 13, fontWeight: 700, marginBottom: 14, textAlign: "center" }}>📱 On Android Chrome</div>
                  {[
                    ["1", <>Tap the <strong>⋮ menu</strong> (top-right)</>],
                    ["2", <>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong></>],
                    ["3", <>Tap <strong>"Install"</strong> to confirm</>],
                  ].map(([n, txt], i) => (
                    <div key={n} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: i < 2 ? 12 : 0 }}>
                      <div style={{ minWidth: 26, height: 26, borderRadius: "50%", background: T.accent + "22", color: T.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800 }}>{n}</div>
                      <div style={{ color: T.text, fontSize: 14, lineHeight: 1.6 }}>{txt}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Desktop */}
              {!isMobile && (
                <div style={{ color: T.textMid, fontSize: 14, lineHeight: 1.6, maxWidth: 420, margin: "0 auto" }}>
                  💻 You're on desktop. Open <strong style={{ color: T.accent }}>mymoneytrip.com</strong> on your phone to install it to your home screen.
                </div>
              )}
            </div>
          </Section>
        </section>
      )}

      {/* ─── SOCIAL PROOF BAR ─── */}
      <section style={{ padding: "40px 0", borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
        <Section style={{ display: "flex", justifyContent: "center", gap: 48, flexWrap: "wrap", alignItems: "center" }}>
          {[["500+", "Active travelers"], ["45+", "Countries tracked"], ["100+", "Currencies supported"], ["4.9★", "User rating"]].map(([n, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ color: T.accent, fontSize: 28, fontWeight: 900, fontFamily: "Sora" }}>{n}</div>
              <div style={{ color: T.textDim, fontSize: 13, fontWeight: 600 }}>{l}</div>
            </div>
          ))}
        </Section>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" style={{ padding: "100px 0" }}>
        <Section>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <h2 style={{ fontFamily: "Sora", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 900, letterSpacing: -1, marginBottom: 16 }}>
              Built for <span style={{ color: T.accent }}>real</span> travel
            </h2>
            <p style={{ color: T.textMid, fontSize: 17, maxWidth: 520, margin: "0 auto" }}>Not another generic expense app. MyTripMoney understands multi-stop journeys, foreign currencies, and the chaos of travel.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            {features.map((f, i) => (
              <div key={i} style={{
                background: T.card, borderRadius: 20, padding: 28, border: `1px solid ${T.border}`,
                transition: "all 0.3s", cursor: "default",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent + "44"; e.currentTarget.style.transform = "translateY(-4px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
                <div style={{ color: T.text, fontSize: 18, fontWeight: 800, marginBottom: 8 }}>{f.title}</div>
                <div style={{ color: T.textMid, fontSize: 14, lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </Section>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section style={{ padding: "80px 0", background: T.surface }}>
        <Section>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <h2 style={{ fontFamily: "Sora", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 900, letterSpacing: -1, marginBottom: 16 }}>
              On your phone in <span style={{ color: T.green }}>30 seconds</span>
            </h2>
          </div>
          <div style={{ display: "flex", gap: 32, justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { step: "1", title: "Open the link", desc: "Tap the link on your phone. No download, no app store.", color: T.accent },
              { step: "2", title: "Add to home screen", desc: "Tap 'Add to Home Screen' — it installs like a native app.", color: T.purple },
              { step: "3", title: "Start tracking", desc: "Create your trip, set your budget, log expenses in 3 taps.", color: T.green },
            ].map((s, i) => (
              <div key={i} style={{ flex: "1 1 260px", maxWidth: 320, textAlign: "center", padding: 24 }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: s.color + "22", border: `2px solid ${s.color}44`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 28, fontWeight: 900, color: s.color }}>{s.step}</div>
                <div style={{ color: T.text, fontSize: 20, fontWeight: 800, marginBottom: 8 }}>{s.title}</div>
                <div style={{ color: T.textMid, fontSize: 14, lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </Section>
      </section>

      {/* ─── VS COMPETITORS ─── */}
      <section style={{ padding: "100px 0" }}>
        <Section>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontFamily: "Sora", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 900, letterSpacing: -1, marginBottom: 16 }}>
              Why not just use <span style={{ color: T.red, textDecoration: "line-through", opacity: 0.6 }}>Splitwise</span>?
            </h2>
            <p style={{ color: T.textMid, fontSize: 16 }}>Generic expense apps weren't built for travel. We were.</p>
          </div>
          <div style={{ maxWidth: 600, margin: "0 auto", background: T.card, borderRadius: 20, overflow: "hidden", border: `1px solid ${T.border}` }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px", padding: "16px 20px", borderBottom: `2px solid ${T.border}` }}>
              <div style={{ color: T.textDim, fontSize: 12, fontWeight: 700 }}>FEATURE</div>
              <div style={{ color: T.accent, fontSize: 12, fontWeight: 700, textAlign: "center" }}>US</div>
              <div style={{ color: T.textDim, fontSize: 12, fontWeight: 700, textAlign: "center" }}>THEM</div>
            </div>
            {comparisons.map((c, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px", padding: "14px 20px", borderBottom: `1px solid ${T.border}`, alignItems: "center" }}>
                <div style={{ color: T.text, fontSize: 14, fontWeight: 600 }}>{c.feature}</div>
                <div style={{ textAlign: "center", fontSize: 18 }}>{c.us ? "✅" : "❌"}</div>
                <div style={{ textAlign: "center", fontSize: 18 }}>{c.them ? "✅" : "❌"}</div>
              </div>
            ))}
          </div>
        </Section>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section style={{ padding: "80px 0", background: T.surface }}>
        <Section>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontFamily: "Sora", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 900, letterSpacing: -1 }}>
              Travelers <span style={{ color: T.yellow }}>love</span> it
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {testimonials.map((t, i) => (
              <div key={i} style={{ background: T.card, borderRadius: 20, padding: 28, border: `1px solid ${T.border}` }}>
                <div style={{ color: T.yellow, fontSize: 20, marginBottom: 16 }}>★★★★★</div>
                <div style={{ color: T.text, fontSize: 15, lineHeight: 1.6, marginBottom: 20, fontStyle: "italic" }}>"{t.quote}"</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg, ${T.accent}, ${T.purple})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 16 }}>{t.name[0]}</div>
                  <div>
                    <div style={{ color: T.text, fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                    <div style={{ color: T.textDim, fontSize: 12 }}>{t.trip}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" style={{ padding: "100px 0" }}>
        <Section>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontFamily: "Sora", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 900, letterSpacing: -1, marginBottom: 16 }}>
              Simple <span style={{ color: T.accent }}>pricing</span>
            </h2>
            <div style={{ display: "inline-flex", background: T.card, borderRadius: 12, padding: 4, border: `1px solid ${T.border}`, marginBottom: 8 }}>
              <button onClick={() => setAnnual(false)} style={{ padding: "10px 20px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, background: !annual ? T.accent + "30" : "transparent", color: !annual ? T.accent : T.textDim }}>Monthly</button>
              <button onClick={() => setAnnual(true)} style={{ padding: "10px 20px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, background: annual ? T.accent + "30" : "transparent", color: annual ? T.accent : T.textDim }}>
                Annual <span style={{ background: T.green + "22", color: T.green, fontSize: 11, padding: "2px 8px", borderRadius: 99, marginLeft: 6, fontWeight: 800 }}>Save 33%</span>
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, maxWidth: 800, margin: "0 auto" }}>
            {/* Free */}
            <div style={{ background: T.card, borderRadius: 24, padding: 36, border: `1px solid ${T.border}` }}>
              <div style={{ color: T.textMid, fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Free</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
                <span style={{ fontSize: 48, fontWeight: 900, color: T.text }}>$0</span>
                <span style={{ color: T.textDim, fontSize: 15 }}>forever</span>
              </div>
              <div style={{ color: T.textMid, fontSize: 14, marginBottom: 28 }}>Perfect for testing on your next trip.</div>
              <button onClick={() => onGetStarted?.()} style={{ width: "100%", background: T.card, color: T.accent, border: `2px solid ${T.accent}44`, borderRadius: 14, padding: "14px", fontSize: 16, fontWeight: 800, cursor: "pointer", marginBottom: 28 }} className="cta-btn">Start Free</button>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {["1 trip", "Single-leg only", "Basic categories", "Local storage", "Budget tracking"].map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, color: T.textMid, fontSize: 14 }}>
                    <span style={{ color: T.green }}>✓</span>{f}
                  </div>
                ))}
                {["Multi-leg trips", "PDF reports", "Email sharing", "Cloud sync"].map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, color: T.textDim, fontSize: 14 }}>
                    <span style={{ color: T.textDim }}>✗</span>{f}
                  </div>
                ))}
              </div>
            </div>

            {/* Pro */}
            <div style={{ background: T.card, borderRadius: 24, padding: 36, border: `2px solid ${T.accent}44`, position: "relative", animation: "glow 3s ease infinite" }}>
              <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: T.accent, color: T.bg, fontSize: 12, fontWeight: 800, padding: "5px 16px", borderRadius: 99 }}>MOST POPULAR</div>
              <div style={{ color: T.accent, fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Pro</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
                <span style={{ fontSize: 48, fontWeight: 900, color: T.text }}>${annual ? "6" : "9"}</span>
                <span style={{ color: T.textDim, fontSize: 15 }}>.{annual ? "67" : "99"}/mo</span>
              </div>
              <div style={{ color: T.textMid, fontSize: 14, marginBottom: 28 }}>{annual ? "Billed $79.99/year" : "Billed monthly"}{annual ? " — save $40" : ""}</div>
              <button onClick={() => onGoPro ? onGoPro(annual ? 'annual' : 'monthly') : onGetStarted?.()} style={{ width: "100%", background: T.accent, color: T.bg, border: "none", borderRadius: 14, padding: "14px", fontSize: 16, fontWeight: 900, cursor: "pointer", marginBottom: 28 }} className="cta-btn">Go Pro →</button>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {["Unlimited trips", "Multi-leg journeys", "100+ currencies", "PDF & email reports", "Cloud sync across devices", "Priority support", "Budget projections", "Trip health score", "All future features"].map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, color: T.text, fontSize: 14 }}>
                    <span style={{ color: T.accent }}>✓</span>{f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>
      </section>

      {/* ─── FAQ (FAQSection w/ JSON-LD schema for GEO/SEO) ─── */}
      <FAQSection id="home-faq" title="Travel budget questions" faqs={ESTIMATOR_FAQS} />

      {/* ─── FOOTER ─── */}
      <footer style={{ padding: "40px 0", borderTop: `1px solid ${T.border}` }}>
        <Section style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "Sora", fontWeight: 800, fontSize: 16 }}>
              <span style={{ color: T.text }}>My</span><span style={{ color: T.accent }}>Trip</span><span style={{ color: T.text }}>Money</span>
            </span>
            <span style={{ color: T.textDim, fontSize: 13 }}>by Maestro Media Group</span>
          </div>
          <div style={{ color: T.textDim, fontSize: 13 }}>© 2026 MyTripMoney. All rights reserved.</div>
        </Section>
      </footer>
    </div>
  );
}
