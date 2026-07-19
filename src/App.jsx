import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { trackPageview } from './lib/analytics';
import { AuthScreen } from './AuthScreen.jsx';
import { PaywallScreen } from './PaywallScreen.jsx';
import LandingPage from './LandingPage.jsx';
import TripApp from './TripApp.jsx';
import { useInstallPrompt, InstallModal } from './InstallPrompt.jsx';
import UpdateBanner from './UpdateBanner.jsx';
import AdminApp from './admin/AdminApp.jsx';
import CheckoutScreen from './CheckoutScreen.jsx';

const T = {
  bg: "#0A0F1E", accent: "#00D4FF", text: "#F0F4FF", textMid: "#8A9BC4", textDim: "#4A5880",
};

const PATH_TO_VIEW = { '/auth': 'auth', '/pricing': 'paywall', '/app': 'app', '/checkout': 'checkout' };
const VIEW_TO_PATH = { landing: '/', auth: '/auth', paywall: '/pricing', app: '/app', checkout: '/checkout' };

function LoadingScreen() {
  return (
    <div style={{
      minHeight: "100vh", background: T.bg, display: "flex",
      flexDirection: "column", alignItems: "center", justifyContent: "center",
      animation: "fadeIn 0.4s ease",
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
      `}</style>
      <img src="/pwa-192x192.png" alt=""
        style={{ width: 96, height: 96, marginBottom: 24, animation: "float 2s ease-in-out infinite" }}
        onError={e => e.target.style.display = "none"} />
      <div style={{ fontSize: 26, fontWeight: 900, color: T.text, letterSpacing: -0.5 }}>
        <span>My</span><span style={{ color: T.accent }}>Trip</span><span>Money</span>
      </div>
      <div style={{ color: T.textDim, fontSize: 13, marginTop: 10, animation: "pulse 1.5s ease-in-out infinite" }}>Loading your trips...</div>
    </div>
  );
}

export default function App() {
  const { user, profile, loading, isPro, signOut } = useAuth();
  const [view, setView] = useState(() => PATH_TO_VIEW[window.location.pathname] || 'landing');
  const [authMode, setAuthMode] = useState("login"); // which tab AuthScreen opens on (login | signup)
  const [paywallFeature, setPaywallFeature] = useState("");
  const [minLoadDone, setMinLoadDone] = useState(false);

  const { triggerInstall, canInstall, isInstalled, isIOS, isAndroid } = useInstallPrompt();
  const [showInstallModal, setShowInstallModal] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinLoadDone(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (window.location.pathname.startsWith('/blog')) return;
    if (window.location.pathname.startsWith('/trip/')) return;
    if (window.location.pathname === '/guides' || window.location.pathname.startsWith('/guides/')) return;
    if (user) {
      const stored = sessionStorage.getItem('tm-redirect');
      if (stored) {
        try {
          const { path, ts } = JSON.parse(stored);
          sessionStorage.removeItem('tm-redirect');
          const fresh = Date.now() - ts < 10 * 60 * 1000;
          if (fresh && path === '/admin') {
            window.location.href = '/admin';
            return;
          }
        } catch {
          sessionStorage.removeItem('tm-redirect');
        }
      }
      // Honor ?next= on first post-auth tick so /pricing → /auth?next=/checkout
      // lands the user on the checkout intent router instead of /app.
      const next = new URLSearchParams(window.location.search).get('next');
      if (next === '/checkout') {
        setView('checkout');
        return;
      }
      setView("app");
    }
  }, [user, loading]);

  // PWA install nudge: fires once per session, only on mobile, only when user just signed in and app isn't installed
  useEffect(() => {
    if (loading || !user || isInstalled) return;
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (!isMobile) return;
    if (sessionStorage.getItem("tm-install-nudged")) return;
    const timer = setTimeout(() => {
      setShowInstallModal(true);
      sessionStorage.setItem("tm-install-nudged", "1");
    }, 1500);
    return () => clearTimeout(timer);
  }, [user, loading, isInstalled]);

  // Track every route including /admin — URL-sync effect runs first so pathname is always current
  useEffect(() => {
    trackPageview(window.location.pathname);
  }, [view]);

  // Sync view → URL (pushState so browser back button has history to traverse)
  useEffect(() => {
    const p = window.location.pathname;
    if (p.startsWith('/admin') || p.startsWith('/blog') || p.startsWith('/trip/') || p === '/guides' || p.startsWith('/guides/')) return;
    const newPath = VIEW_TO_PATH[view] || '/';
    if (window.location.pathname !== newPath) {
      window.history.pushState({ view }, '', newPath);
    }
  }, [view]);

  // Browser/phone hardware back button → restore view from URL
  useEffect(() => {
    const onPop = () => {
      const path = window.location.pathname;
      if (!path.startsWith('/admin') && !path.startsWith('/blog') && !path.startsWith('/trip/') && path !== '/guides' && !path.startsWith('/guides/')) {
        setView(PATH_TO_VIEW[path] || 'landing');
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Admin route: bypass the splash-screen timer, but still wait for auth to settle
  if (window.location.pathname === '/admin') {
    if (loading) return <LoadingScreen />;
    return <AdminApp />;
  }
  // Blog routes: SSR'd by /api/blog-index and /api/blog-post — don't render SPA
  if (window.location.pathname.startsWith('/blog')) {
    return null;
  }
  // /trip/* destination pages: SSR'd by /api/trip-page — don't render SPA
  if (window.location.pathname.startsWith('/trip/')) {
    return null;
  }
  // /guides and /guides/* pages: SSR'd by /api/guide-page — don't render SPA
  if (window.location.pathname === '/guides' || window.location.pathname.startsWith('/guides/')) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    setView("landing");
  };

  // Start Free handler — logged out: write a marker + send to auth so the
  // post-auth redirect lands them in the tracker without going through Stripe.
  const handleStartFree = () => {
    if (user) { setView("app"); return; }
    try { localStorage.setItem("pendingPlan", "free"); } catch { /* ignore */ }
    window.location.assign("/auth?next=/app");
  };

  // Go Pro handler — billing comes from LandingPage's pricing toggle.
  // Logged out: stash intent + bounce through auth to the /checkout router.
  // Logged in: skip the paywall middleman and create the Stripe session directly.
  const handleGoPro = async (billing) => {
    const cycle = billing === 'monthly' ? 'monthly' : 'annual';
    if (!user) {
      try {
        localStorage.setItem("pendingCheckout", JSON.stringify({
          plan: "pro", billing: cycle, createdAt: new Date().toISOString(),
        }));
      } catch { /* ignore */ }
      window.location.assign("/auth?next=/checkout");
      return;
    }
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: cycle, userId: user.id, email: user.email }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.assign(data.url);
      } else {
        alert(data.error || 'Could not start checkout. Please try again.');
      }
    } catch {
      alert('Could not connect to payment server. Please try again.');
    }
  };

  const renderView = () => {
    if (view === "landing" && !user) {
      return <LandingPage
        onGetStarted={handleStartFree}
        onLogin={() => { setAuthMode("login"); setView("auth"); }}
        onRegister={() => { setAuthMode("signup"); setView("auth"); }}
        onGoPro={handleGoPro}
        onInstall={() => setShowInstallModal(true)}
        canInstall={canInstall}
        isInstalled={isInstalled}
        isIOS={isIOS}
        isAndroid={isAndroid}
        triggerInstall={triggerInstall}
      />;
    }
    if (view === "auth" && !user) return <AuthScreen onBack={() => setView("landing")} initialMode={authMode} />;
    if (view === "paywall") return <PaywallScreen feature={paywallFeature} onBack={() => user ? setView("app") : setView("landing")} user={user} />;
    // CheckoutScreen handles its own auth wait (useAuth().loading) and
    // bounces to /auth?next=/checkout if unauthenticated, so it must render
    // without sitting behind the global splash.
    if (view === "checkout") return <CheckoutScreen />;
    // Protected views past this point need the user record + min splash time.
    // Public views above (landing/auth/paywall/checkout) render immediately
    // so the marketing surfaces aren't held back by the Supabase session check.
    if (loading || !minLoadDone) return <LoadingScreen />;
    if (user) return <TripApp user={user} profile={profile} isPro={isPro} onSignOut={handleSignOut} onInstall={() => setShowInstallModal(true)} isInstalled={isInstalled} canInstall={canInstall} isIOS={isIOS} isMobile={/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)} onPaywall={(feature) => { setPaywallFeature(feature); setView("paywall"); }} />;
    return <LandingPage onGetStarted={handleStartFree} onLogin={() => { setAuthMode("login"); setView("auth"); }} onRegister={() => { setAuthMode("signup"); setView("auth"); }} onGoPro={handleGoPro} />;
  };

  // Logout now lives inside TripApp's header control row (label · 🔄 · ⚙️ · Log out),
  // wired via the onSignOut={handleSignOut} prop passed to <TripApp/> above.

  return (
    <>
      {renderView()}
      {showInstallModal && <InstallModal onClose={() => setShowInstallModal(false)} isIOS={isIOS} isAndroid={isAndroid} canInstall={canInstall} triggerInstall={triggerInstall} />}
      <UpdateBanner />
    </>
  );
}
