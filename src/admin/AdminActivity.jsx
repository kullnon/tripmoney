import { useState, useEffect } from 'react';
import { getActivityFeed } from './adminQueries';

const T = {
  bg: "#0A0F1E", surface: "#111827", card: "#1A2235", cardHover: "#1F2A40",
  border: "#1E2D45", accent: "#00D4FF", accentDim: "#0099BB",
  accentGlow: "rgba(0,212,255,0.15)", green: "#00E5A0", greenDim: "#00A872",
  orange: "#FF8A00", red: "#FF4560", purple: "#7B61FF", yellow: "#FFD600",
  text: "#F0F4FF", textMid: "#8A9BC4", textDim: "#4A5880",
};

const TYPE_CONFIG = {
  signup:  { icon: '👤', color: T.green },
  upgrade: { icon: '⭐', color: T.accent },
  trip:    { icon: '✈️', color: T.textMid },
};

function relativeTime(ts) {
  const diffMs = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diffMs / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d < 30) return `${d}d ago`;
  return new Date(ts).toISOString().slice(0, 10);
}

export default function AdminActivity() {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActivityFeed(50)
      .then(data => { setFeed(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px 32px', color: T.textMid, textAlign: 'center', fontSize: 14 }}>
        Loading activity…
      </div>
    );
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 820, margin: '0 auto' }}>
      <div style={{
        background: T.card, border: `1px solid ${T.border}`,
        borderRadius: 12, overflow: 'hidden',
      }}>
        {feed.length === 0 ? (
          <div style={{ color: T.textDim, textAlign: 'center', padding: '40px 0', fontSize: 14 }}>
            No activity yet
          </div>
        ) : feed.map((event, i) => {
          const cfg = TYPE_CONFIG[event.type] || TYPE_CONFIG.trip;
          return (
            <div
              key={event.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 24px',
                borderBottom: i < feed.length - 1 ? `1px solid ${T.border}` : 'none',
              }}
            >
              <div style={{ fontSize: 18, width: 26, textAlign: 'center', flexShrink: 0 }}>
                {cfg.icon}
              </div>
              <div style={{ flex: 1, fontSize: 14, color: cfg.color, lineHeight: 1.4 }}>
                {event.description}
              </div>
              <div style={{ fontSize: 12, color: T.textDim, flexShrink: 0 }}>
                {relativeTime(event.timestamp)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
