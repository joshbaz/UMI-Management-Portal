import { defineConfig } from 'vite';
import crypto from 'crypto';
import fs from 'fs';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';
import pkg from './package.json';

const iconHash = crypto.createHash('md5').update(fs.readFileSync('public/pwa-512x512.png')).digest('hex').slice(0, 8)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      registerOptions: {
        updateViaCache: 'none'
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'safari-pinned-tab.svg'],
      manifest: {
        name: 'DRIMS Research Centre Portal',
        short_name: 'DRIMS Research Centre',
        description: 'DRIMS - Research Centre Portal',
        id: '/research/',
        theme_color: '#059669',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: `pwa-192x192.png?v=${iconHash}`,
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: `pwa-192x192.png?v=${iconHash}`,
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: `pwa-512x512.png?v=${iconHash}`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: `pwa-512x512.png?v=${iconHash}`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB limit
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  define: {
    __APP_VERSION__: JSON.stringify({
      version: pkg.version,
      build: new Date().toISOString(),
      iconVersion: iconHash
    })
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});