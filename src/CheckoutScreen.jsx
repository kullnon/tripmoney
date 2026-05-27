import { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

// Intent router for /checkout. Reaches here in three scenarios:
//   1. Just-signed-in user with `pendingCheckout` in localStorage (Pro path):
//      hand the stored billing cycle to Stripe and redirect to checkout URL.
//   2. Authenticated user without intent: bounce to /pricing so they can pick.
//   3. Unauthenticated user (direct link or refresh mid-flight): bounce to
//      /auth?next=/checkout so the auth flow rehydrates the intent.

const T = {
  bg: "#0A0F1E", card: "#1A2235", border: "#1E2D45",
  accent: "#00D4FF", text: "#F0F4FF", textMid: "#8A9BC4",
};

export default function CheckoutScreen() {
  const { user, loading } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    if (loading) return;

    if (!user) {
      window.location.assign('/auth?next=/checkout');
      return;
    }

    let pending = null;
    try {
      const raw = localStorage.getItem('pendingCheckout');
      if (raw) pending = JSON.parse(raw);
    } catch { /* ignore */ }

    if (!pending || !pending.billing || !['annual', 'monthly'].includes(pending.billing)) {
      // Reached /checkout without a stored intent — send them to pick a plan.
      window.location.assign('/pricing');
      return;
    }

    let cancelled = false;
    (async () => {
      // Distinguishing network failures, server failures, validation errors,
      // and malformed success responses means a future config break (missing
      // env var, bad price ID) gives a useful signal instead of masquerading
      // as a generic "could not connect". Each branch logs the raw response
      // so the root cause is one DevTools click away.
      let res;
      try {
        res = await fetch('/api/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plan: pending.billing,
            userId: user.id,
            email: user.email,
          }),
        });
      } catch (networkErr) {
        if (cancelled) return;
        console.error('[checkout] fetch failed:', networkErr);
        setError('Network error. Check your connection and try again.');
        return;
      }

      // Read the body as text once, then try to parse — lets us surface a
      // useful message even when the route returns an HTML error page.
      const rawBody = await res.text();
      let data = null;
      try { data = rawBody ? JSON.parse(rawBody) : null; } catch { /* not JSON */ }

      if (cancelled) return;

      if (!res.ok) {
        console.error('[checkout] api error', { status: res.status, body: rawBody });
        if (data && typeof data.error === 'string' && res.status >= 400 && res.status < 500) {
          // 4xx with structured error → show the API's message verbatim.
          setError(data.error);
        } else {
          // 5xx, or any non-JSON failure (e.g. FUNCTION_INVOCATION_FAILED HTML page).
          setError('Payment service is temporarily unavailable. Please try again or contact support@mytripmoney.com.');
        }
        return;
      }

      if (!data || typeof data.url !== 'string' || !data.url) {
        console.error('[checkout] 2xx response missing url field:', rawBody);
        setError('Checkout session could not be created. Please try again.');
        return;
      }

      // Clear before redirect so a back-button bounce doesn't re-fire.
      try { localStorage.removeItem('pendingCheckout'); } catch { /* ignore */ }
      window.location.assign(data.url);
    })();

    return () => { cancelled = true; };
  }, [user, loading]);

  return (
    <div style={{
      minHeight: '100vh',
      background: T.bg,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 48, marginBottom: 20 }}>🔒</div>
      <div style={{ color: T.text, fontSize: 22, fontWeight: 900, marginBottom: 10 }}>
        {error ? 'Checkout error' : 'Taking you to checkout…'}
      </div>
      <div style={{ color: T.textMid, fontSize: 14, maxWidth: 320, lineHeight: 1.6 }}>
        {error
          ? error
          : 'Hang on while we hand you off to Stripe to complete your Pro upgrade.'}
      </div>
      {error && (
        <button
          onClick={() => window.location.assign('/pricing')}
          style={{
            marginTop: 24,
            background: T.accent, color: T.bg, border: 'none',
            borderRadius: 12, padding: '12px 24px', fontSize: 15,
            fontWeight: 800, cursor: 'pointer',
          }}
        >
          Back to pricing
        </button>
      )}
    </div>
  );
}
