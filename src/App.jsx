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
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <img src="/favicon.png" alt="" style={{ width: 64, height: 64, borderRadius: 16, marginBottom: 20 }} onError={e => e.target.style.display = "none"} />
      <div style={{ fontSize: 24, fontWeight: 900, color: T.text }}>
        <span>My</span><span style={{ color: T.accent }}>Trip</span><span>Money</span>
      </div>
      <div style={{ color: T.textDim, fontSize: 14, marginTop: 8 }}>Loading...</div>
    </div>
  );
}

export default function App() {
  const { user, profile, loading, isPro, signOut } = useAuth();
  const [view, setView] = useState("landing"); // landing, auth, app, paywall
  const [paywallFeature, setPaywallFeature] = useState("");

  // Route based on auth state
  useEffect(() => {
    if (loading) return;
    if (user) {
      setView("app");
    }
  }, [user, loading]);

  // Loading state
  if (loading) return <LoadingScreen />;

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

  // Fallback to landing
  return <LandingPage onGetStarted={() => setView("auth")} onLogin={() => setView("auth")} />;
}
