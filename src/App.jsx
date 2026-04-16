import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { AuthScreen } from './AuthScreen.jsx';
import { PaywallScreen } from './PaywallScreen.jsx';
import LandingPage from './LandingPage.jsx';
import TripApp from './TripApp.jsx';

const T = {
  bg: "#0A0F1E", accent: "#00D4FF", text: "#F0F4FF", textMid: "#8A9BC4", textDim: "#4A5880",
};

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
  const [view, setView] = useState("landing");
  const [paywallFeature, setPaywallFeature] = useState("");
  const [minLoadDone, setMinLoadDone] = useState(false);

  // Minimum loading time so the splash doesn't flash
  useEffect(() => {
    const timer = setTimeout(() => setMinLoadDone(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Route based on auth state
  useEffect(() => {
    if (loading) return;
    if (user) {
      setView("app");
    }
  }, [user, loading]);

  // Show loading until BOTH auth loaded AND minimum time passed
  if (loading || !minLoadDone) return <LoadingScreen />;

  // Landing page (not logged in)
  if (view === "landing" && !user) {
    return <LandingPage
      onGetStarted={() => setView("auth")}
      onLogin={() => setView("auth")}
    />;
  }

  // Auth screen
  if (view === "auth" && !user) {
    return <AuthScreen onBack={() => setView("landing")} />;
  }

  // Paywall
  if (view === "paywall") {
    return <PaywallScreen feature={paywallFeature} onBack={() => setView("app")} />;
  }

  // Main app (logged in)
  if (user) {
    return <TripApp
      user={user}
      profile={profile}
      isPro={isPro}
      onSignOut={signOut}
      onPaywall={(feature) => { setPaywallFeature(feature); setView("paywall"); }}
    />;
  }

  // Fallback
  return <LandingPage onGetStarted={() => setView("auth")} onLogin={() => setView("auth")} />;
}
