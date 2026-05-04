import { useState } from 'react';
import { useAuth } from '../AuthContext';
import AdminDashboard from './AdminDashboard';
import AdminGrants from './AdminGrants';
import AdminActivity from './AdminActivity';

const T = {
  bg: "#0A0F1E", surface: "#111827", card: "#1A2235", cardHover: "#1F2A40",
  border: "#1E2D45", accent: "#00D4FF", accentDim: "#0099BB",
  accentGlow: "rgba(0,212,255,0.15)", green: "#00E5A0", greenDim: "#00A872",
  orange: "#FF8A00", red: "#FF4560", purple: "#7B61FF", yellow: "#FFD600",
  text: "#F0F4FF", textMid: "#8A9BC4", textDim: "#4A5880",
};

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'grants',    label: 'Grant Pro' },
  { id: 'activity',  label: 'Activity' },
];

export default function AdminApp() {
  const { user, profile, loading, signOut } = useAuth();
  const [tab, setTab] = useState('dashboard');

  // Wait for auth to settle before checking guards
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: T.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ color: T.textMid, fontSize: 15 }}>Loading…</span>
      </div>
    );
  }

  if (!user) {
    sessionStorage.setItem('tm-redirect', JSON.stringify({ path: '/admin', ts: Date.now() }));
    window.location.href = '/auth';
    return null;
  }

  if (!profile?.is_admin) {
    window.location.href = '/';
    return null;
  }

  const displayName = profile.email || user.email || 'Admin';

  return (
    <div style={{
      minHeight: '100vh', background: T.bg, color: T.text,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <header style={{
        background: T.surface, borderBottom: `1px solid ${T.border}`,
        padding: '0 32px', height: 56,
        display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0,
      }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: T.text, flex: 1, letterSpacing: -0.3 }}>
          Command Center
        </div>

        {/* Live indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%', background: T.green,
            boxShadow: `0 0 6px ${T.green}`,
          }} />
          <span style={{ fontSize: 12, color: T.green, fontWeight: 600 }}>Live</span>
        </div>

        <div style={{
          fontSize: 13, color: T.textMid,
          maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {displayName}
        </div>

        <button
          onClick={() => window.location.href = '/'}
          style={{
            background: 'transparent', border: `1px solid ${T.border}`,
            borderRadius: 6, padding: '5px 12px', color: T.textMid,
            cursor: 'pointer', fontSize: 12, transition: 'border-color 0.15s',
          }}
        >
          ← App
        </button>

        <button
          onClick={signOut}
          style={{
            background: 'transparent', border: `1px solid ${T.red}`,
            borderRadius: 6, padding: '5px 12px', color: T.red,
            cursor: 'pointer', fontSize: 12, fontWeight: 600,
          }}
        >
          Log Out
        </button>
      </header>

      {/* Tab nav */}
      <nav style={{
        background: T.surface, borderBottom: `1px solid ${T.border}`,
        padding: '0 32px', display: 'flex', flexShrink: 0,
      }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '14px 20px', background: 'transparent', border: 'none',
              borderBottom: tab === t.id ? `2px solid ${T.accent}` : '2px solid transparent',
              color: tab === t.id ? T.accent : T.textMid,
              cursor: 'pointer', fontSize: 14,
              fontWeight: tab === t.id ? 700 : 400,
              transition: 'all 0.15s', marginBottom: -1,
            }}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main style={{ flex: 1 }}>
        {tab === 'dashboard' && <AdminDashboard />}
        {tab === 'grants'    && <AdminGrants />}
        {tab === 'activity'  && <AdminActivity />}
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center', padding: '14px 32px',
        fontSize: 12, color: T.textDim,
        borderTop: `1px solid ${T.border}`, flexShrink: 0,
      }}>
        © 2026 Maestro Media Group · All Rights Reserved
      </footer>
    </div>
  );
}
