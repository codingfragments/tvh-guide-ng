import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit(),
    SvelteKitPWA({
      devOptions: {
        enabled: true,
      },
      workbox: {
        // Avoid default prerendered glob warning when no prerendered output exists.
        // SvelteKitPWA injects prerendered patterns unless modifyURLPrefix is defined.
        modifyURLPrefix: {},
        globPatterns: ['client/**/*.{js,css,html,ico,png,svg,webp,json,txt,woff2,webmanifest}'],
      },
      manifest: {
        name: 'TVH Guide',
        short_name: 'TVH Guide',
        description: 'Electronic Program Guide for TVHeadend',
        id: '/',
        start_url: '/',
        scope: '/',
        theme_color: '#24273a',
        background_color: '#24273a',
        display: 'standalone',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
});
