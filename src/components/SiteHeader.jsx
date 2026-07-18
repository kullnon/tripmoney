import { useState } from "react";

// ─── SITE HEADER (marketing / logged-out nav) ─────────────────────
// MyTripMoney's fixed top nav: brand logo + one-word wordmark on the left,
// links + CTA on the right. Rendered by LandingPage, which owns the global
// .nav-links / .nav-pricing / .nav-cta responsive rules and the Sora @font.
//
// Robustness (fixes the "logo vanishes on scroll / mobile" report):
//   • The brand mark is ALWAYS rendered and flexShrink:0 — it can never be
//     squeezed to zero width when the row gets tight on a phone.
//   • If /favicon.png fails to load, we DON'T remove the element (the old
//     onError did `display:none`, which permanently dropped the logo after a
//     single transient miss). Instead we swap to an "M" badge, so a brand mark
//     stays pinned to the left of the wordmark in every scroll state.
//   • gap:12 gives the icon and wordmark breathing room (was cramped at 8).

const T = {
  bg: "#0A0F1E", border: "#1E2D45", accent: "#00D4FF",
  text: "#F0F4FF", textMid: "#8A9BC4", card: "#1A2235",
};

export default function SiteHeader({ scrollY = 0, onGetStarted }) {
  const [logoOk, setLogoOk] = useState(true);

  return (
    <nav
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        // Solid bg always so content scrolling underneath is fully hidden.
        // Border-bottom fades in once scrolled.
        background: T.bg,
        borderBottom: scrollY > 50 ? `1px solid ${T.border}` : "1px solid transparent",
        transition: "border-color 0.3s",
        padding: "16px 0",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        {/* Brand: logo pinned LEFT of the wordmark, never shrinks, gap for breathing room */}
        <a
          href="/"
          style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, textDecoration: "none" }}
          aria-label="MyTripMoney home"
        >
          {logoOk ? (
            <img
              src="/favicon.png"
              alt="MyTripMoney logo"
              width={22}
              height={22}
              style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, display: "block" }}
              onError={() => setLogoOk(false)}
            />
          ) : (
            <span
              aria-hidden="true"
              style={{
                width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: T.accent, color: T.bg, fontFamily: "Sora, sans-serif",
                fontWeight: 800, fontSize: 13, lineHeight: 1,
              }}
            >
              M
            </span>
          )}
          {/* One word: MyTripMoney — no spaces, no dots. Color split kept. */}
          <span style={{ fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: 17, whiteSpace: "nowrap" }}>
            <span style={{ color: T.text }}>My</span><span style={{ color: T.accent }}>Trip</span><span style={{ color: T.text }}>Money</span>
          </span>
        </a>

        <div className="nav-links" style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          <a href="/guides" className="nav-pricing" style={{ color: T.textMid, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>Guides</a>
          <a href="#pricing" className="nav-pricing" style={{ color: T.textMid, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>Pricing</a>
          <a href="https://blog.mytripmoney.com" className="nav-pricing" style={{ color: T.textMid, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>Blog</a>
          <button onClick={() => onGetStarted && onGetStarted()} style={{ background: T.accent, color: T.bg, border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 14, fontWeight: 800, cursor: "pointer" }} className="cta-btn nav-cta">Get Started</button>
        </div>
      </div>
    </nav>
  );
}
