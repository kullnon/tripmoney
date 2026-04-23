import { useState } from 'react';

const T = {
  bg: "#0A0F1E", card: "#1A2235", border: "#1E2D45",
  accent: "#00D4FF", green: "#00E5A0", purple: "#7B61FF",
  text: "#F0F4FF", textMid: "#8A9BC4", textDim: "#4A5880",
};

export function PaywallScreen({ feature, onBack, user }) {
  const [annual, setAnnual] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleUpgrade() {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: annual ? 'annual' : 'monthly',
          userId: user?.id,
          email: user?.email,
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Could not connect to payment server. Please try again.');
    }

    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>
      <button onClick={onBack} style={{ position: "absolute", top: 20, left: 20, color: T.accent, background: "none", border: "none", fontSize: 14, cursor: "pointer", fontWeight: 600 }}>← Back</button>

      <div style={{ fontSize: 48, marginBottom: 20 }}>🔒</div>
      <div style={{ color: T.text, fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Upgrade to Pro</div>
      <div style={{ color: T.textMid, fontSize: 15, marginBottom: 32, maxWidth: 300 }}>
        <span style={{ color: T.accent, fontWeight: 700 }}>{feature}</span> is a Pro feature. Unlock everything for the price of a coffee.
      </div>

      <div style={{ display: "inline-flex", background: T.card, borderRadius: 12, padding: 4, border: `1px solid ${T.border}`, marginBottom: 24 }}>
        <button onClick={() => setAnnual(false)} style={{ padding: "10px 20px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, background: !annual ? T.accent + "30" : "transparent", color: !annual ? T.accent : T.textDim }}>Monthly</button>
        <button onClick={() => setAnnual(true)} style={{ padding: "10px 20px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, background: annual ? T.accent + "30" : "transparent", color: annual ? T.accent : T.textDim }}>
          Annual <span style={{ background: T.green + "22", color: T.green, fontSize: 11, padding: "2px 8px", borderRadius: 99, marginLeft: 4, fontWeight: 800 }}>-33%</span>
        </button>
      </div>

      <div style={{ background: T.card, borderRadius: 20, padding: 28, border: `2px solid ${T.accent}44`, width: "100%", maxWidth: 320, marginBottom: 20 }}>
        <div style={{ color: T.accent, fontSize: 14, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>Pro</div>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 4, marginBottom: 4 }}>
          <span style={{ fontSize: 48, fontWeight: 900, color: T.text }}>${annual ? "6" : "9"}</span>
          <span style={{ color: T.textDim, fontSize: 16 }}>.{annual ? "67" : "99"}/mo</span>
        </div>
        <div style={{ color: T.textMid, fontSize: 13, marginBottom: 24 }}>{annual ? "Billed $79.99/year" : "Billed monthly"}</div>

        <button
          onClick={handleUpgrade}
          disabled={loading}
          style={{
            width: "100%", background: loading ? T.textDim : T.accent, color: T.bg,
            border: "none", borderRadius: 14, padding: "15px", fontSize: 17,
            fontWeight: 900, cursor: loading ? "not-allowed" : "pointer", marginBottom: 20,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Connecting..." : "Upgrade Now →"}
        </button>

        {error && <div style={{ color: "#FF6B6B", fontSize: 13, marginBottom: 12 }}>{error}</div>}

        <div style={{ display: "flex", flexDirection: "column", gap: 10, textAlign: "left" }}>
          {["Unlimited trips", "Multi-leg journeys", "100+ currencies", "PDF & email reports", "Cloud sync", "All future features"].map(f => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, color: T.text, fontSize: 14 }}>
              <span style={{ color: T.accent }}>✓</span>{f}
            </div>
          ))}
        </div>
      </div>

      <div style={{ color: T.textDim, fontSize: 13 }}>Cancel anytime. No contracts.</div>
    </div>
  );
}
