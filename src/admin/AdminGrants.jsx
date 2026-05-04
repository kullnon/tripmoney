import { useState, useEffect } from 'react';
import { grantPro, revokePro, listGrants } from './adminQueries';

const T = {
  bg: "#0A0F1E", surface: "#111827", card: "#1A2235", cardHover: "#1F2A40",
  border: "#1E2D45", accent: "#00D4FF", accentDim: "#0099BB",
  accentGlow: "rgba(0,212,255,0.15)", green: "#00E5A0", greenDim: "#00A872",
  orange: "#FF8A00", red: "#FF4560", purple: "#7B61FF", yellow: "#FFD600",
  text: "#F0F4FF", textMid: "#8A9BC4", textDim: "#4A5880",
};

function Toast({ msg, isError, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 4000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div style={{
      position: 'fixed', top: 24, right: 24, zIndex: 200,
      background: isError ? T.red : T.green,
      color: '#fff', padding: '12px 20px', borderRadius: 10,
      fontSize: 14, fontWeight: 600,
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
      maxWidth: 380, lineHeight: 1.5,
    }}>
      {msg}
    </div>
  );
}

export default function AdminGrants() {
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [grants, setGrants] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingGrants, setLoadingGrants] = useState(true);
  const [toast, setToast] = useState(null);

  const refresh = () => {
    setLoadingGrants(true);
    listGrants()
      .then(data => { setGrants(data); setLoadingGrants(false); })
      .catch(() => setLoadingGrants(false));
  };

  useEffect(() => { refresh(); }, []);

  const showToast = (msg, isError = false) => setToast({ msg, isError });

  const handleGrant = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;
    setSubmitting(true);
    try {
      const result = await grantPro(trimmedEmail, note.trim());
      const existed = result?.existing_profile_upgraded;
      const suffix =
        existed === true ? ' Existing profile upgraded to Pro.' :
        existed === false ? ' Grant recorded — user not signed up yet.' : '';
      showToast(`Pro granted to ${trimmedEmail}.${suffix}`);
      setEmail('');
      setNote('');
      refresh();
    } catch (e) {
      showToast(e.message || 'Failed to grant Pro.', true);
    }
    setSubmitting(false);
  };

  const handleRevoke = async (grantEmail) => {
    if (!window.confirm(`Revoke Pro from ${grantEmail}?`)) return;
    try {
      await revokePro(grantEmail);
      showToast(`Pro revoked from ${grantEmail}.`);
      refresh();
    } catch (e) {
      showToast(e.message || 'Failed to revoke Pro.', true);
    }
  };

  const inputStyle = {
    background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8,
    padding: '10px 14px', color: T.text, fontSize: 14, outline: 'none', width: '100%',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ padding: '28px 32px', maxWidth: 820, margin: '0 auto' }}>
      {toast && <Toast msg={toast.msg} isError={toast.isError} onDone={() => setToast(null)} />}

      {/* Grant form */}
      <div style={{
        background: T.card, border: `1px solid ${T.border}`,
        borderRadius: 12, padding: '24px 28px', marginBottom: 28,
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 20 }}>Grant Pro Access</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleGrant()}
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="Note (optional) — e.g. Beta tester, Partner, Investor"
            value={note}
            onChange={e => setNote(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleGrant()}
            style={inputStyle}
          />
          <button
            onClick={handleGrant}
            disabled={submitting || !email.trim()}
            style={{
              alignSelf: 'flex-start', padding: '10px 28px', borderRadius: 8,
              background: email.trim() && !submitting ? T.accent : T.textDim,
              color: email.trim() && !submitting ? T.bg : T.surface,
              border: 'none',
              cursor: email.trim() && !submitting ? 'pointer' : 'not-allowed',
              fontSize: 14, fontWeight: 700, transition: 'all 0.15s',
            }}
          >
            {submitting ? 'Granting…' : 'Grant Pro'}
          </button>
        </div>
      </div>

      {/* Grants table */}
      <div style={{
        background: T.card, border: `1px solid ${T.border}`,
        borderRadius: 12, padding: '24px 28px',
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 16 }}>Pro Grants</div>
        {loadingGrants ? (
          <div style={{ color: T.textDim, fontSize: 13, padding: '12px 0' }}>Loading…</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Email', 'Note', 'Granted', ''].map((h, i) => (
                  <th key={i} style={{
                    textAlign: 'left', color: T.textDim, fontWeight: 600,
                    paddingBottom: 10, borderBottom: `1px solid ${T.border}`,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grants.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ color: T.textDim, textAlign: 'center', padding: '24px 0' }}>No grants yet</td>
                </tr>
              ) : grants.map((g, i) => (
                <tr key={g.id || `${g.email}-${i}`} style={{ borderTop: i === 0 ? 'none' : `1px solid ${T.border}` }}>
                  <td style={{ padding: '12px 0', color: T.text }}>{g.email}</td>
                  <td style={{ padding: '12px 0', color: T.textMid }}>{g.note || '—'}</td>
                  <td style={{ padding: '12px 0', color: T.textDim }}>{g.granted_at?.slice(0, 10)}</td>
                  <td style={{ padding: '12px 0' }}>
                    <button
                      onClick={() => handleRevoke(g.email)}
                      style={{
                        padding: '4px 12px', borderRadius: 6,
                        background: 'transparent', border: `1px solid ${T.red}`,
                        color: T.red, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                        transition: 'all 0.15s',
                      }}
                    >
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
