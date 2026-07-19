import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // 'prompt' so a new deploy surfaces the in-app "A new version is available"
      // banner instead of silently auto-reloading. injectRegister:false → the ONLY
      // SW registration is via useRegisterSW() in <UpdateBanner/> (no double-register).
      registerType: 'prompt',
      injectRegister: false,
      workbox: {
        // SSR'd routes must bypass the SPA-shell navigation fallback. Without
        // this denylist the SW intercepts top-level navigations to /trip/*,
        // /blog/*, and /guides[/*] and serves the precached index.html,
        // leaving the user on a blank dark page because main.jsx deliberately
        // skips mounting React on those paths.
        navigateFallbackDenylist: [/^\/trip\//, /^\/blog\//, /^\/guides(\/|$)/, /^\/api\//],
      },
      manifest: {
        name: 'MyTripMoney — Track Every Dollar',
        short_name: 'MyTripMoney',
        description: 'Multi-currency travel expense tracker.',
        theme_color: '#0A0F1E',
        background_color: '#0A0F1E',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      }
    })
  ]
});
