import { useState, useEffect } from "react";

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

export default function SiteHeader({ scrollY = 0, onLogin, onRegister }) {
  const [logoOk, setLogoOk] = useState(true);
  // Drive the responsive layout from JS (matchMedia), NOT a CSS media query — so the
  // Log-in/Register pills can never be hidden by a stylesheet. On narrow screens the
  // Guides/Pricing/Blog text links are simply not rendered; the pills always are.
  const [narrow, setNarrow] = useState(() => typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const onChange = () => setNarrow(mq.matches);
    onChange();
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else mq.addListener(onChange);
    return () => { if (mq.removeEventListener) mq.removeEventListener("change", onChange); else mq.removeListener(onChange); };
  }, []);
  const pillStyle = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    border: `1px solid ${T.accent}`, color: T.accent, background: T.accent + "14",
    borderRadius: 999, padding: narrow ? "6px 13px" : "7px 16px",
    fontSize: narrow ? 13 : 14, fontWeight: 700, lineHeight: 1, cursor: "pointer",
    whiteSpace: "nowrap", fontFamily: "inherit", flexShrink: 0,
  };

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
      {/* Two identical accent pills (Log in / Register) ALWAYS render. The
          Guides/Pricing/Blog links render only on wider screens (JS-gated). */}
      <style>{`.sh-pill:hover{ background:${T.accent}26 !important; }`}</style>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        {/* Brand: logo pinned LEFT of the wordmark, never shrinks, gap for breathing room */}
        <a
          href="/"
          style={{ display: "flex", alignItems: "center", gap: narrow ? 6 : 8, flexShrink: 1, minWidth: 0, textDecoration: "none" }}
          aria-label="MyTripMoney home"
        >
          {logoOk ? (
            <img
              src="/favicon.png"
              alt="MyTripMoney logo"
              width={narrow ? 20 : 22}
              height={narrow ? 20 : 22}
              style={{ width: narrow ? 20 : 22, height: narrow ? 20 : 22, borderRadius: 6, flexShrink: 0, display: "block" }}
              onError={() => setLogoOk(false)}
            />
          ) : (
            <span
              aria-hidden="true"
              style={{
                width: narrow ? 20 : 22, height: narrow ? 20 : 22, borderRadius: 6, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: T.accent, color: T.bg, fontFamily: "Sora, sans-serif",
                fontWeight: 800, fontSize: 13, lineHeight: 1,
              }}
            >
              M
            </span>
          )}
          {/* One word: MyTripMoney — ellipsizes (never pushes the pills off-screen). */}
          <span style={{ fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: narrow ? 15 : 17, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>
            <span style={{ color: T.text }}>My</span><span style={{ color: T.accent }}>Trip</span><span style={{ color: T.text }}>Money</span>
          </span>
        </a>

        <div style={{ display: "flex", alignItems: "center", gap: narrow ? 6 : 16, flexShrink: 0 }}>
          {/* Guides/Pricing/Blog only on wider screens; pills below always render. */}
          {!narrow && <>
            <a href="/guides" style={{ color: T.textMid, textDecoration: "none", fontSize: 14, fontWeight: 600, whiteSpace: "nowrap" }}>Guides</a>
            <a href="#pricing" style={{ color: T.textMid, textDecoration: "none", fontSize: 14, fontWeight: 600, whiteSpace: "nowrap" }}>Pricing</a>
            <a href="https://blog.mytripmoney.com" style={{ color: T.textMid, textDecoration: "none", fontSize: 14, fontWeight: 600, whiteSpace: "nowrap" }}>Blog</a>
          </>}
          <div style={{ display: "flex", alignItems: "center", gap: narrow ? 6 : 8, flexShrink: 0 }}>
            <button type="button" className="sh-pill" style={pillStyle} onClick={() => onLogin && onLogin()}>Log in</button>
            <button type="button" className="sh-pill" style={pillStyle} onClick={() => onRegister && onRegister()}>Register</button>
          </div>
        </div>
      </div>
    </nav>
  );
}
