import { useState, useEffect } from "react";

const T = {
  bg: "#0A0F1E", surface: "#111827", card: "#1A2235",
  border: "#1E2D45", accent: "#00D4FF", green: "#00E5A0",
  orange: "#FF8A00", red: "#FF4560", purple: "#7B61FF", yellow: "#FFD600",
  text: "#F0F4FF", textMid: "#8A9BC4", textDim: "#4A5880",
};

export default function LandingPage({ onGetStarted, onLogin, onInstall, canInstall, isInstalled, isIOS, isAndroid, triggerInstall }) {
  const [annual, setAnnual] = useState(true);
  const [emailInput, setEmailInput] = useState("");
  const [scrollY, setScrollY] = useState(0);
  const [installing, setInstalling] = useState(false);

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

  const faqs = [
    { q: "Do I need to download anything?", a: "Nope. MyTripMoney is a web app that installs directly to your phone's home screen. No App Store, no Play Store. Open the link, tap 'Add to Home Screen', done." },
    { q: "Does it work without internet?", a: "Yes. All your data saves locally on your device. You can log expenses on a plane, in the mountains, anywhere. It syncs when you're back online." },
    { q: "Can I use it for multiple trips?", a: "Free accounts get 1 trip. Pro accounts get unlimited trips, multi-leg journeys, PDF reports, and all currencies." },
    { q: "What currencies are supported?", a: "Over 100 currencies worldwide — from US Dollars to Haitian Gourdes to Japanese Yen. If your country has a currency, we support it." },
    { q: "Can I cancel anytime?", a: "Yes. Cancel with one click. No contracts, no tricks. Your data stays yours." },
  ];

  const [openFaq, setOpenFaq] = useState(null);

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
      `}</style>

      {/* ─── NAV ─── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrollY > 50 ? T.bg + "EE" : "transparent",
        backdropFilter: scrollY > 50 ? "blur(16px)" : "none",
        borderBottom: scrollY > 50 ? `1px solid ${T.border}` : "none",
        transition: "all 0.3s",
        padding: "16px 0",
      }}>
        <Section style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img src="/favicon.png" alt="" style={{ width: 32, height: 32, borderRadius: 8 }} onError={e => e.target.style.display = "none"} />
            <span style={{ fontFamily: "Sora", fontWeight: 800, fontSize: 20 }}>
              <span style={{ color: T.text }}>My</span><span style={{ color: T.accent }}>Trip</span><span style={{ color: T.text }}>Money</span>
            </span>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <a href="#pricing" style={{ color: T.textMid, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>Pricing</a>
            <button onClick={() => onGetStarted && onGetStarted()} style={{ background: T.accent, color: T.bg, border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 14, fontWeight: 800, cursor: "pointer" }} className="cta-btn">Get Started</button>
          </div>
        </Section>
      </nav>

      {/* ─── HERO ─── */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden", paddingTop: 80 }}>
        {/* Background glow */}
        <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 600, height: 600, background: `radial-gradient(circle, ${T.accent}15 0%, transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "40%", right: "10%", width: 300, height: 300, background: `radial-gradient(circle, ${T.purple}10 0%, transparent 70%)`, pointerEvents: "none" }} />

        <Section>
          <div style={{ display: "flex", alignItems: "center", gap: 60, flexWrap: "wrap", justifyContent: "center" }}>
            <div style={{ flex: "1 1 400px", maxWidth: 560 }}>
              <div className="fade-up" style={{ display: "inline-block", background: T.accent + "15", border: `1px solid ${T.accent}33`, borderRadius: 99, padding: "6px 16px", marginBottom: 24 }}>
                <span style={{ color: T.accent, fontSize: 13, fontWeight: 700 }}>✨ No download required — works on any phone</span>
              </div>
              <h1 className="fade-up fade-up-1" style={{ fontFamily: "Sora", fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 900, lineHeight: 1.1, letterSpacing: -2, marginBottom: 20 }}>
                Track every dollar.<br />
                <span style={{ color: T.accent }}>Every currency.</span><br />
                Every leg of your trip.
              </h1>
              <p className="fade-up fade-up-2" style={{ color: T.textMid, fontSize: 18, lineHeight: 1.6, marginBottom: 36, maxWidth: 460 }}>
                The travel expense tracker that handles multi-leg journeys, 100+ currencies, and real-world travel chaos — all from your phone.
              </p>
              <div className="fade-up fade-up-3" style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <button onClick={() => onGetStarted && onGetStarted()} className="cta-btn" style={{ background: T.accent, color: T.bg, border: "none", borderRadius: 14, padding: "16px 36px", fontSize: 17, fontWeight: 900, cursor: "pointer" }}>
                  Start Free →
                </button>
                <a href="#features" style={{ display: "flex", alignItems: "center", gap: 8, color: T.textMid, textDecoration: "none", fontSize: 15, fontWeight: 600, padding: "16px 20px" }}>
                  See Features ↓
                </a>
              </div>
              <div className="fade-up fade-up-4" style={{ display: "flex", gap: 24, marginTop: 32, color: T.textDim, fontSize: 13 }}>
                <span>✓ Free to start</span>
                <span>✓ No app store needed</span>
                <span>✓ Works offline</span>
              </div>
            </div>

            {/* Phone mockup */}
            <div className="fade-up fade-up-3" style={{ flex: "0 0 280px", position: "relative", animation: "float 4s ease-in-out infinite" }}>
              <div style={{
                width: 280, height: 560, borderRadius: 36, overflow: "hidden",
                background: T.surface, border: `3px solid ${T.border}`,
                boxShadow: `0 40px 80px rgba(0,0,0,0.5), 0 0 60px ${T.accent}15`,
                position: "relative",
              }}>
                {/* Status bar */}
                <div style={{ height: 44, background: T.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 80, height: 24, borderRadius: 12, background: T.surface }} />
                </div>
                {/* App header */}
                <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 3 }}><span style={{ fontSize: 14, fontWeight: 900, color: T.text }}>My</span><span style={{ fontSize: 14, fontWeight: 900, color: T.accent }}>Trip</span><span style={{ fontSize: 14, fontWeight: 900, color: T.text }}>Money</span></div>
                  <span style={{ fontSize: 10, color: T.textDim }}>🇵🇷 Puerto Rico</span>
                </div>
                {/* Mock dashboard */}
                <div style={{ padding: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <div><div style={{ color: T.textDim, fontSize: 9, fontWeight: 600 }}>ACTIVE TRIP</div><div style={{ color: T.text, fontSize: 15, fontWeight: 900 }}>🇵🇷 Puerto Rico</div></div>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: T.green + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: T.green }}>A</div>
                  </div>
                  {/* Budget ring mock */}
                  <div style={{ background: T.card, borderRadius: 14, padding: 14, display: "flex", alignItems: "center", gap: 14, marginBottom: 10, border: `1px solid ${T.border}` }}>
                    <svg width={56} height={56} style={{ transform: "rotate(-90deg)" }}>
                      <circle cx={28} cy={28} r={22} fill="none" stroke={T.border} strokeWidth={6} />
                      <circle cx={28} cy={28} r={22} fill="none" stroke={T.green} strokeWidth={6} strokeDasharray={138} strokeDashoffset={42} strokeLinecap="round" />
                      <text x={28} y={28} textAnchor="middle" dominantBaseline="middle" fill={T.green} fontSize={11} fontWeight={800} style={{ transform: "rotate(90deg)", transformOrigin: "28px 28px" }}>60%</text>
                    </svg>
                    <div>
                      <div style={{ color: T.green, fontSize: 20, fontWeight: 900 }}>$1,510</div>
                      <div style={{ color: T.textDim, fontSize: 10 }}>of $2,500 budget</div>
                      <div style={{ color: T.green, fontSize: 10, fontWeight: 700, marginTop: 2 }}>$990 remaining</div>
                    </div>
                  </div>
                  {/* Quick stats */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
                    {[["Today", "$70", T.yellow], ["Avg/Day", "$251", T.accent]].map(([l, v, c]) => (
                      <div key={l} style={{ background: T.card, borderRadius: 10, padding: 10, border: `1px solid ${T.border}` }}>
                        <div style={{ color: T.textDim, fontSize: 8, fontWeight: 600 }}>{l}</div>
                        <div style={{ color: c, fontSize: 16, fontWeight: 900 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  {/* Recent */}
                  {[["✈️", "American Airlines", "$340"], ["🏨", "Airbnb 5 nights", "$620"], ["🍽️", "La Factoria", "$94"]].map(([icon, title, amt]) => (
                    <div key={title} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderTop: `1px solid ${T.border}` }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: T.card, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, border: `1px solid ${T.border}` }}>{icon}</div>
                      <div style={{ flex: 1 }}><div style={{ color: T.text, fontSize: 11, fontWeight: 600 }}>{title}</div></div>
                      <div style={{ color: T.text, fontSize: 12, fontWeight: 800 }}>{amt}</div>
                    </div>
                  ))}
                </div>
                {/* Bottom nav mock */}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: T.surface + "F0", borderTop: `1px solid ${T.border}`, display: "flex", padding: "8px 0 12px" }}>
                  {["🏠", "📋", "💰", "📊"].map((icon, i) => (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                      <span style={{ fontSize: 16 }}>{icon}</span>
                      {i === 0 && <div style={{ width: 16, height: 2, background: T.accent, borderRadius: 99 }} />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
              <button style={{ width: "100%", background: T.card, color: T.accent, border: `2px solid ${T.accent}44`, borderRadius: 14, padding: "14px", fontSize: 16, fontWeight: 800, cursor: "pointer", marginBottom: 28 }} className="cta-btn">Start Free</button>
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
              <button style={{ width: "100%", background: T.accent, color: T.bg, border: "none", borderRadius: 14, padding: "14px", fontSize: 16, fontWeight: 900, cursor: "pointer", marginBottom: 28 }} className="cta-btn">Go Pro →</button>
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

      {/* ─── FAQ ─── */}
      <section style={{ padding: "80px 0", background: T.surface }}>
        <Section>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontFamily: "Sora", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 900, letterSpacing: -1 }}>Questions?</h2>
          </div>
          <div style={{ maxWidth: 640, margin: "0 auto" }}>
            {faqs.map((f, i) => (
              <div key={i} style={{ borderBottom: `1px solid ${T.border}` }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0", background: "none", border: "none", cursor: "pointer", color: T.text, fontSize: 16, fontWeight: 700, textAlign: "left" }}>
                  {f.q}
                  <span style={{ color: T.accent, fontSize: 20, transition: "transform 0.2s", transform: openFaq === i ? "rotate(45deg)" : "rotate(0)" }}>+</span>
                </button>
                {openFaq === i && (
                  <div style={{ color: T.textMid, fontSize: 14, lineHeight: 1.7, paddingBottom: 20, paddingRight: 40 }}>{f.a}</div>
                )}
              </div>
            ))}
          </div>
        </Section>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section id="signup" style={{ padding: "100px 0", textAlign: "center" }}>
        <Section>
          <h2 style={{ fontFamily: "Sora", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, letterSpacing: -2, marginBottom: 16 }}>
            Your next trip deserves<br /><span style={{ color: T.accent }}>better tracking</span>
          </h2>
          <p style={{ color: T.textMid, fontSize: 17, marginBottom: 40, maxWidth: 480, margin: "0 auto 40px" }}>Join hundreds of travelers who never lose track of their spending.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", maxWidth: 480, margin: "0 auto" }}>
            <input value={emailInput} onChange={e => setEmailInput(e.target.value)} type="email" placeholder="Your email" style={{ flex: "1 1 240px", background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: "16px 20px", color: T.text, fontSize: 16, outline: "none", fontFamily: "inherit" }} />
            <button className="cta-btn" style={{ background: T.accent, color: T.bg, border: "none", borderRadius: 14, padding: "16px 32px", fontSize: 16, fontWeight: 900, cursor: "pointer", flexShrink: 0 }}>Get Started Free</button>
          </div>
          <div style={{ color: T.textDim, fontSize: 13, marginTop: 16 }}>Free forever. No credit card required.</div>
        </Section>
      </section>

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
