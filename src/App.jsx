import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { AuthScreen } from './AuthScreen.jsx';
import { PaywallScreen } from './PaywallScreen.jsx';
import LandingPage from './LandingPage.jsx';
import TripApp from './TripApp.jsx';
import { useInstallPrompt, InstallModal } from './InstallPrompt.jsx';
import AdminApp from './admin/AdminApp.jsx';

const T = {
  bg: "#0A0F1E", accent: "#00D4FF", text: "#F0F4FF", textMid: "#8A9BC4", textDim: "#4A5880",
};

const PATH_TO_VIEW = { '/auth': 'auth', '/pricing': 'paywall', '/app': 'app' };
const VIEW_TO_PATH = { landing: '/', auth: '/auth', paywall: '/pricing', app: '/app' };

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
    if (user) setView("app");
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

  // Sync view → URL (pushState so browser back button has history to traverse)
  useEffect(() => {
    if (window.location.pathname.startsWith('/admin')) return;
    const newPath = VIEW_TO_PATH[view] || '/';
    if (window.location.pathname !== newPath) {
      window.history.pushState({ view }, '', newPath);
    }
  }, [view]);

  // Browser/phone hardware back button → restore view from URL
  useEffect(() => {
    const onPop = () => {
      const path = window.location.pathname;
      if (!path.startsWith('/admin')) {
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

  if (loading || !minLoadDone) return <LoadingScreen />;

  const handleSignOut = async () => {
    await signOut();
    setView("landing");
  };

  const renderView = () => {
    if (view === "landing" && !user) {
      return <LandingPage
        onGetStarted={() => setView("auth")}
        onLogin={() => setView("auth")}
        onGoPro={() => user ? setView("paywall") : setView("auth")}
        onInstall={() => setShowInstallModal(true)}
        canInstall={canInstall}
        isInstalled={isInstalled}
        isIOS={isIOS}
        isAndroid={isAndroid}
        triggerInstall={triggerInstall}
      />;
    }
    if (view === "auth" && !user) return <AuthScreen onBack={() => setView("landing")} />;
    if (view === "paywall") return <PaywallScreen feature={paywallFeature} onBack={() => setView("app")} user={user} />;
    if (user) return <TripApp user={user} profile={profile} isPro={isPro} onSignOut={handleSignOut} onInstall={() => setShowInstallModal(true)} isInstalled={isInstalled} canInstall={canInstall} isIOS={isIOS} isMobile={/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)} onPaywall={(feature) => { setPaywallFeature(feature); setView("paywall"); }} />;
    return <LandingPage onGetStarted={() => setView("auth")} onLogin={() => setView("auth")} />;
  };

  // Global logout: show on every logged-in screen (TripApp's gear-icon logout can coexist)
  const showGlobalLogout = !!user;

  return (
    <>
      {showGlobalLogout && (
        <div style={{ position: "fixed", top: 16, right: 20, zIndex: 200 }}>
          <button
            onClick={handleSignOut}
            style={{
              background: "transparent",
              border: `1px solid ${T.accent}55`,
              color: T.accent,
              borderRadius: 10,
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Log out
          </button>
        </div>
      )}
      {renderView()}
      {showInstallModal && <InstallModal onClose={() => setShowInstallModal(false)} isIOS={isIOS} isAndroid={isAndroid} canInstall={canInstall} triggerInstall={triggerInstall} />}
    </>
  );
}
