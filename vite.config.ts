import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      workbox: {
        maximumFileSizeToCacheInBytes: 5_000_000,
        // Only the app shell is precached. Supabase responses are deliberately
        // NOT runtime-cached: they include signed-in customers' orders and
        // profiles, which would outlive logout on shared devices.
        cleanupOutdatedCaches: true,
      },
      manifest: {
        name: 'J&M Curtain Studio',
        short_name: 'J&M Studio',
        description: 'Custom curtains, ready-made options, premium fabrics & expert alterations in Harare.',
        theme_color: '#FBF1E6',
        background_color: '#FBF1E6',
        display: 'standalone',
        start_url: '/',
        orientation: 'portrait-primary',
        scope: '/',
        categories: ['shopping', 'lifestyle'],
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  resolve: {
    alias: { '@': '/src' },
  },
});
