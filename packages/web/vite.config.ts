import svgr from '@svgr/rollup'
import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { checker } from 'vite-plugin-checker'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({ babel: { rootMode: 'upward', configFile: true } }),
    legacy(),
    checker({ typescript: true }),
    svgr({ ref: true, titleProp: true }),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
      },
      devOptions: {
        enabled: true,
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'logo.svg'],
      manifest: {
        'name': 'Yiwen',
        'short_name': 'Yiwen',
        'start_url': '.',
        'display': 'standalone',
        'theme_color': '#ffffff',
        'background_color': '#ffffff',
        'description': 'AI-based Translingual Knowledge Content Platform.',
        'icons': [
          {
            'src': 'https://cdn.yiwen.pub/web/favicon-64x64.png',
            'sizes': '64x64',
            'type': 'image/png',
          },
          {
            'src': 'https://cdn.yiwen.pub/web/favicon-192x192.png',
            'sizes': '192x192',
            'type': 'image/png',
          },
          {
            'src': 'https://cdn.yiwen.pub/web/favicon-512x512.png',
            'sizes': '512x512',
            'type': 'image/png',
            'purpose': 'any',
          },
          {
            'src': 'https://cdn.yiwen.pub/web/favicon-512x512-maskable.png',
            'sizes': '512x512',
            'type': 'image/png',
            'purpose': 'maskable',
          },
        ],
        'related_applications': [
          {
            'platform': 'web',
            'url': 'https://www.yiwen.ai',
          },
        ],
      },
    }),
  ],
})
