import { useEffect, useMemo, useState } from "react";
import {
  destinationCosts, destinationList, TIERS, HOME_CURRENCIES,
  ORIGINS, ORIGIN_CODES, DEFAULT_ORIGIN, originName, flightEstimateFor,
} from "../../lib/destinationCosts.js";

const T = {
  bg: "#0A0F1E", surface: "#111827", card: "#1A2235",
  border: "#1E2D45", accent: "#00D4FF", green: "#00E5A0",
  purple: "#7B61FF", yellow: "#FFD600",
  text: "#F0F4FF", textMid: "#8A9BC4", textDim: "#4A5880",
};

const inputBase = {
  width: "100%",
  background: T.card,
  border: `1px solid ${T.border}`,
  borderRadius: 12,
  padding: "14px 16px",
  color: T.text,
  fontSize: 16,
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

const CAT_META = [
  { id: "accommodation", label: "Accommodation", icon: "🏨", color: T.purple },
  { id: "food",          label: "Food & drinks", icon: "🍽️", color: "#FF8A00" },
  { id: "transport",     label: "Local transport", icon: "🚗", color: T.green },
  { id: "activities",    label: "Activities",     icon: "🎫", color: T.yellow },
];

// Module-level FX cache. exchangerate.host returns USD-based rates.
const FX_TTL_MS = 60_000;
let fxCache = { ts: 0, rates: null, pending: null };

async function fetchUsdRates() {
  const now = Date.now();
  if (fxCache.rates && now - fxCache.ts < FX_TTL_MS) return fxCache.rates;
  if (fxCache.pending) return fxCache.pending;
  fxCache.pending = (async () => {
    try {
      const res = await fetch("https://api.exchangerate.host/latest?base=USD");
      const j = await res.json();
      if (j && j.rates) {
        fxCache = { ts: Date.now(), rates: j.rates, pending: null };
        return j.rates;
      }
    } catch { /* network down → fall through */ }
    // Fallback: only USD → USD known. Other conversions will be 1:1.
    const fallback = { USD: 1 };
    fxCache = { ts: Date.now(), rates: fallback, pending: null };
    return fallback;
  })();
  return fxCache.pending;
}

function symbolFor(code) {
  const m = HOME_CURRENCIES.find((c) => c.code === code);
  return m ? m.symbol : code + " ";
}

function fmtMoney(amount, code) {
  const sym = symbolFor(code);
  const n = Math.round(amount || 0);
  return `${sym}${n.toLocaleString("en-US")}`;
}

export default function Estimator({ preselectSlug = "paris", compact = false }) {
  // Initial slug resolves (in priority order):
  //   1. ?destination=... URL param (set by SSR /trip/[dest] pages when CTA is clicked)
  //   2. preselectSlug prop
  //   3. Fallback "paris"
  const [slug, setSlug] = useState(() => {
    const fallback = preselectSlug in destinationCosts ? preselectSlug : "paris";
    if (typeof window === "undefined") return fallback;
    const q = new URLSearchParams(window.location.search).get("destination");
    return q && q in destinationCosts ? q : fallback;
  });
  const [days, setDays] = useState(7);
  const [tier, setTier] = useState("midRange");
  const [travelers, setTravelers] = useState(1);
  const [homeCurrency, setHomeCurrency] = useState("USD");
  const [rate, setRate] = useState(1); // USD → homeCurrency multiplier
  // Departing-from country — persisted to localStorage so returning users
  // don't have to re-pick on every visit. Independent of home currency
  // (a user in Mexico may still want to see costs in USD).
  const [origin, setOrigin] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_ORIGIN;
    try {
      const stored = localStorage.getItem("tripOrigin");
      if (stored && ORIGIN_CODES.includes(stored)) return stored;
    } catch { /* ignore */ }
    return DEFAULT_ORIGIN;
  });

  const destinations = useMemo(() => destinationList(), []);
  const dest = destinationCosts[slug];

  // Load FX on mount + whenever homeCurrency changes. setState-after-await is
  // unavoidable here — we're syncing remote FX into React state.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const rates = await fetchUsdRates();
      if (cancelled) return;
      setRate(homeCurrency === "USD" ? 1 : (rates[homeCurrency] || 1));
    })();
    return () => { cancelled = true; };
  }, [homeCurrency]);

  if (!dest) return null;

  const tierData = dest[tier];
  const perDayUsd = tierData.accommodation + tierData.food + tierData.transport + tierData.activities;
  const onGroundUsd = perDayUsd * Math.max(1, Number(days) || 1) * Math.max(1, Number(travelers) || 1);
  const perTravelerFlight = flightEstimateFor(slug, origin);
  const flightUsd   = perTravelerFlight * Math.max(1, Number(travelers) || 1);
  const grandTotalUsd = onGroundUsd + flightUsd;

  const toHome = (usd) => usd * rate;
  const onGroundHome = toHome(onGroundUsd);
  const flightHome   = toHome(flightUsd);
  const grandHome    = toHome(grandTotalUsd);
  const perTravelerHome = grandHome / Math.max(1, Number(travelers) || 1);

  // Daily breakdown (per person, in home currency)
  const dailyBreakdown = CAT_META.map((c) => ({
    ...c,
    daily: toHome(tierData[c.id]),
  }));

  const handleSave = () => {
    const payload = {
      destination: dest.name,
      slug,
      country: dest.country,
      countryCode: dest.countryCode || "OT",
      days: Number(days) || 1,
      budget: Math.round(grandHome),
      onGroundBudget: Math.round(onGroundHome),
      flightBudget: Math.round(flightHome),
      currency: homeCurrency,
      style: tier,
      travelers: Number(travelers) || 1,
      departureDate: null,
      returnDate: null,
      createdAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem("pendingTrip", JSON.stringify(payload));
    } catch { /* private mode etc — best-effort */ }
    window.location.assign("/auth?next=/app");
  };

  const handleScrollUp = () => {
    const el = document.getElementById("estimator-inputs");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div style={{
      maxWidth: 720,
      margin: "0 auto",
      background: T.card,
      borderRadius: 24,
      border: `1px solid ${T.border}`,
      padding: compact ? "24px 20px" : "32px 28px",
      boxShadow: `0 24px 60px rgba(0,0,0,0.35), 0 0 80px ${T.accent}10`,
    }}>
      <div id="estimator-inputs">
        {/* Departing from */}
        <Label>Departing from</Label>
        <select
          value={origin}
          onChange={(e) => {
            const next = e.target.value;
            setOrigin(next);
            try { localStorage.setItem("tripOrigin", next); } catch { /* ignore */ }
          }}
          style={{ ...inputBase, appearance: "auto", marginBottom: 14 }}
        >
          {ORIGINS.map((o) => (
            <option key={o.code} value={o.code}>{o.name}</option>
          ))}
        </select>

        {/* Destination */}
        <Label>Destination</Label>
        <select
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          style={{ ...inputBase, appearance: "auto", marginBottom: 14 }}
        >
          {destinations.map((d) => (
            <option key={d.slug} value={d.slug}>{d.name} — {d.country}</option>
          ))}
        </select>

        {/* Days + Travelers row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          <div>
            <Label>Trip length (days)</Label>
            <input
              type="number"
              min={1}
              max={90}
              value={days}
              onChange={(e) => setDays(Math.max(1, Math.min(90, Number(e.target.value) || 1)))}
              style={inputBase}
            />
          </div>
          <div>
            <Label>Travelers</Label>
            <input
              type="number"
              min={1}
              max={20}
              value={travelers}
              onChange={(e) => setTravelers(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
              style={inputBase}
            />
          </div>
        </div>

        {/* Travel style */}
        <Label>Travel style</Label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 14 }}>
          {TIERS.map((t) => {
            const active = tier === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTier(t.id)}
                type="button"
                style={{
                  background: active ? T.accent + "22" : T.bg,
                  border: `2px solid ${active ? T.accent : T.border}`,
                  borderRadius: 14,
                  padding: "14px 10px",
                  color: active ? T.accent : T.text,
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 15, marginBottom: 4 }}>{t.label}</div>
                <div style={{ fontSize: 11, fontWeight: 500, color: active ? T.accent : T.textMid, lineHeight: 1.3 }}>
                  {t.blurb}
                </div>
              </button>
            );
          })}
        </div>

        {/* Home currency */}
        <Label>Home currency</Label>
        <select
          value={homeCurrency}
          onChange={(e) => setHomeCurrency(e.target.value)}
          style={{ ...inputBase, appearance: "auto", marginBottom: 8 }}
        >
          {HOME_CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
          ))}
        </select>
      </div>

      {/* Result card */}
      <div style={{
        marginTop: 24,
        background: T.bg,
        border: `1px solid ${T.accent}33`,
        borderRadius: 18,
        padding: "22px 22px 24px",
      }}>
        <div style={{ color: T.textMid, fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
          Estimated total trip cost
        </div>
        <div style={{
          fontFamily: "Sora, 'DM Sans', sans-serif",
          fontSize: "clamp(36px, 7vw, 56px)",
          fontWeight: 900,
          color: T.accent,
          letterSpacing: -1.5,
          lineHeight: 1.05,
          marginBottom: 6,
        }}>
          {fmtMoney(grandHome, homeCurrency)}
        </div>
        <div style={{ color: T.textMid, fontSize: 13, marginBottom: 18 }}>
          {dest.name} · {days} day{Number(days) === 1 ? "" : "s"} · {TIERS.find((t) => t.id === tier).label.toLowerCase()}
          {Number(travelers) > 1 && (
            <> · <strong style={{ color: T.text }}>{fmtMoney(perTravelerHome, homeCurrency)}</strong> per traveler</>
          )}
        </div>

        {/* Daily breakdown */}
        <div style={{ color: T.textDim, fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 10 }}>
          Daily per person
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, marginBottom: 16 }}>
          {dailyBreakdown.map((c) => (
            <div key={c.id} style={{
              background: T.card,
              borderRadius: 10,
              padding: "10px 12px",
              border: `1px solid ${T.border}`,
            }}>
              <div style={{ fontSize: 18 }}>{c.icon}</div>
              <div style={{ color: T.text, fontSize: 16, fontWeight: 800, marginTop: 2 }}>
                {fmtMoney(c.daily, homeCurrency)}
              </div>
              <div style={{ color: T.textMid, fontSize: 11 }}>{c.label}</div>
            </div>
          ))}
        </div>

        {/* Flight + on-ground breakdown */}
        <div style={{ display: "flex", justifyContent: "space-between", color: T.textMid, fontSize: 13, padding: "10px 0", borderTop: `1px solid ${T.border}` }}>
          <span>On-the-ground spend</span>
          <span style={{ color: T.text, fontWeight: 700 }}>{fmtMoney(onGroundHome, homeCurrency)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", color: T.textMid, fontSize: 13, padding: "10px 0", borderTop: `1px solid ${T.border}` }}>
          <span>Flights estimate <span style={{ color: T.textDim }}>(from {originName(origin)}, rough)</span></span>
          <span style={{ color: T.text, fontWeight: 700 }}>{fmtMoney(flightHome, homeCurrency)}</span>
        </div>
      </div>

      {/* CTAs */}
      <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
        <button
          onClick={handleSave}
          type="button"
          style={{
            background: T.accent,
            color: T.bg,
            border: "none",
            borderRadius: 14,
            padding: "16px 24px",
            fontSize: 16,
            fontWeight: 900,
            cursor: "pointer",
            boxShadow: `0 10px 30px ${T.accent}44`,
          }}
        >
          Save this trip & start tracking →
        </button>
        <button
          onClick={handleScrollUp}
          type="button"
          style={{
            background: "transparent",
            color: T.textMid,
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            padding: "12px 20px",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Adjust the numbers ↑
        </button>
      </div>

      <div style={{ marginTop: 14, color: T.textDim, fontSize: 11, textAlign: "center" }}>
        Free · No signup to estimate · Live FX from exchangerate.host
      </div>
    </div>
  );
}

function Label({ children }) {
  return (
    <div style={{
      color: T.textMid,
      fontSize: 12,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: 0.6,
      marginBottom: 6,
    }}>{children}</div>
  );
}
