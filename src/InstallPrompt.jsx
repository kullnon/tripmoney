import { useState, useEffect } from 'react';

const T = {
  bg: "#0A0F1E", card: "#1A2235", border: "#1E2D45",
  accent: "#00D4FF", green: "#00E5A0", purple: "#7B61FF",
  text: "#F0F4FF", textMid: "#8A9BC4", textDim: "#4A5880", red: "#FF4560",
};

// Hook that captures the install prompt
export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true);
    }

    // Capture the install prompt event
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Detect when app is installed
    const installedHandler = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const triggerInstall = async () => {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      return true;
    }
    return false;
  };

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  const canInstall = !!deferredPrompt && !isInstalled;

  return { triggerInstall, canInstall, isInstalled, isIOS, isAndroid, deferredPrompt };
}

// Modal with install instructions (for iOS or fallback)
export function InstallModal({ onClose, isIOS, isAndroid, canInstall, triggerInstall }) {
  const [installing, setInstalling] = useState(false);

  const handleInstall = async () => {
    setInstalling(true);
    const ok = await triggerInstall();
    if (ok) onClose();
    setInstalling(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)" }} />
      <div style={{ position: "relative", background: T.card, borderRadius: 24, padding: 28, maxWidth: 380, width: "100%", border: `1px solid ${T.border}`, textAlign: "center" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: T.textDim, fontSize: 24, cursor: "pointer" }}>×</button>

        <img src="/pwa-192x192.png" alt="" style={{ width: 80, height: 80, marginBottom: 16 }} onError={e => e.target.style.display = "none"} />

        <div style={{ color: T.text, fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Install MyTripMoney</div>
        <div style={{ color: T.textMid, fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
          Get the app on your home screen. Works offline, feels like a native app.
        </div>

        {canInstall && (
          <button onClick={handleInstall} disabled={installing} style={{
            width: "100%", background: T.accent, color: T.bg, border: "none",
            borderRadius: 14, padding: 16, fontSize: 17, fontWeight: 900, cursor: "pointer", marginBottom: 16,
          }}>{installing ? "Installing..." : "📲 Install Now"}</button>
        )}

        {isIOS && (
          <div style={{ textAlign: "left", background: T.bg, borderRadius: 12, padding: 16 }}>
            <div style={{ color: T.accent, fontSize: 13, fontWeight: 700, marginBottom: 12 }}>📱 On iPhone / iPad</div>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10 }}>
              <div style={{ minWidth: 24, height: 24, borderRadius: "50%", background: T.accent + "22", color: T.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800 }}>1</div>
              <div style={{ color: T.text, fontSize: 13, lineHeight: 1.5 }}>Tap the <strong>Share button</strong> <span style={{ color: T.accent }}>⬆️</span> at the bottom of Safari</div>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10 }}>
              <div style={{ minWidth: 24, height: 24, borderRadius: "50%", background: T.accent + "22", color: T.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800 }}>2</div>
              <div style={{ color: T.text, fontSize: 13, lineHeight: 1.5 }}>Scroll down and tap <strong>"Add to Home Screen"</strong></div>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ minWidth: 24, height: 24, borderRadius: "50%", background: T.accent + "22", color: T.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800 }}>3</div>
              <div style={{ color: T.text, fontSize: 13, lineHeight: 1.5 }}>Tap <strong>"Add"</strong> in the top-right corner</div>
            </div>
          </div>
        )}

        {!canInstall && !isIOS && (
          <div style={{ textAlign: "left", background: T.bg, borderRadius: 12, padding: 16 }}>
            <div style={{ color: T.accent, fontSize: 13, fontWeight: 700, marginBottom: 12 }}>📱 On Android</div>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10 }}>
              <div style={{ minWidth: 24, height: 24, borderRadius: "50%", background: T.accent + "22", color: T.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800 }}>1</div>
              <div style={{ color: T.text, fontSize: 13, lineHeight: 1.5 }}>Tap the <strong>⋮ menu</strong> (top-right in Chrome)</div>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10 }}>
              <div style={{ minWidth: 24, height: 24, borderRadius: "50%", background: T.accent + "22", color: T.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800 }}>2</div>
              <div style={{ color: T.text, fontSize: 13, lineHeight: 1.5 }}>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong></div>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ minWidth: 24, height: 24, borderRadius: "50%", background: T.accent + "22", color: T.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800 }}>3</div>
              <div style={{ color: T.text, fontSize: 13, lineHeight: 1.5 }}>Tap <strong>"Install"</strong> to confirm</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Floating install banner (shown at top of landing page on mobile)
export function InstallBanner({ onClick, onDismiss }) {
  return (
    <div style={{
      position: "fixed", top: 70, left: 16, right: 16, zIndex: 90,
      background: `linear-gradient(135deg, ${T.accent}, ${T.purple})`,
      borderRadius: 14, padding: "12px 14px",
      display: "flex", alignItems: "center", gap: 12,
      boxShadow: `0 8px 32px ${T.accent}44`,
      maxWidth: 500, margin: "0 auto",
    }}>
      <img src="/favicon.png" alt="" style={{ width: 36, height: 36, flexShrink: 0 }} onError={e => e.target.style.display = "none"} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: "#fff", fontSize: 13, fontWeight: 800 }}>Install MyTripMoney</div>
        <div style={{ color: "#fff", fontSize: 11, opacity: 0.9 }}>Get it on your home screen</div>
      </div>
      <button onClick={onClick} style={{
        background: "#fff", color: T.bg, border: "none", borderRadius: 10,
        padding: "8px 14px", fontSize: 13, fontWeight: 800, cursor: "pointer", flexShrink: 0,
      }}>Install</button>
      <button onClick={onDismiss} style={{ background: "none", border: "none", color: "#fff", fontSize: 20, cursor: "pointer", padding: 4, opacity: 0.7 }}>×</button>
    </div>
  );
}

// Big install button for the welcome screen / post-signup
export function InstallButton({ onClick, style = {} }) {
  return (
    <button onClick={onClick} style={{
      background: `linear-gradient(135deg, ${T.accent}, ${T.purple})`,
      color: "#fff", border: "none", borderRadius: 14,
      padding: "14px 24px", fontSize: 15, fontWeight: 800,
      cursor: "pointer", display: "flex", alignItems: "center",
      gap: 10, boxShadow: `0 8px 24px ${T.accent}33`,
      ...style,
    }}>
      📲 Install on Home Screen
    </button>
  );
}
