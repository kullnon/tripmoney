import { useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

// ─── UPDATE-AVAILABLE BANNER (new app version, NOT pro/paid) ───────
// Detection: SERVICE WORKER update event (vite-plugin-pwa in 'prompt' mode).
// When a new bundle is deployed while the app is open, the new SW installs and
// waits → onNeedRefresh fires → we show a dismissible banner at the bottom (above
// the tracker's bottom nav). "Update" activates the waiting SW and reloads to the
// latest bundle; the banner then disappears and won't return until the NEXT deploy.
// (This is unrelated to Upgrade-to-Pro / monetization.)

const T = {
  surface: "#111827", accent: "#00D4FF", bg: "#0A0F1E",
  text: "#F0F4FF", textMid: "#8A9BC4",
};

export default function UpdateBanner() {
  const [dismissed, setDismissed] = useState(false);
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    // A new version was detected → un-dismiss, so a previously-dismissed banner
    // reappears only when the NEXT new deploy lands (not for the same version).
    onNeedRefresh() { setDismissed(false); },
    // Keep checking for a fresh deploy while the tab stays open.
    onRegisteredSW(swUrl, r) {
      if (r) setInterval(() => { r.update().catch(() => {}); }, 60_000);
    },
  });

  if (!needRefresh || dismissed) return null;

  return (
    <div
      role="status"
      style={{
        position: "fixed",
        left: "50%",
        transform: "translateX(-50%)",
        // Sit ABOVE the tracker's fixed bottom nav (~64px + safe area), never over it.
        bottom: "calc(78px + env(safe-area-inset-bottom, 0px))",
        width: "calc(100% - 24px)",
        maxWidth: 366,
        zIndex: 150,
        background: T.surface,
        border: `1px solid ${T.accent}55`,
        borderRadius: 14,
        padding: "12px 14px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
      }}
    >
      <div style={{ flex: 1, minWidth: 0, color: T.text, fontSize: 14, fontWeight: 800 }}>
        A new version is available
      </div>
      <button
        onClick={() => updateServiceWorker(true)}
        style={{ flexShrink: 0, background: T.accent, color: T.bg, border: "none", borderRadius: 10, padding: "9px 16px", fontSize: 14, fontWeight: 800, cursor: "pointer" }}
      >
        Update
      </button>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        style={{ flexShrink: 0, background: "none", border: "none", color: T.textMid, fontSize: 20, cursor: "pointer", lineHeight: 1, padding: 0 }}
      >
        ×
      </button>
    </div>
  );
}
