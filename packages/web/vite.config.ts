import svgr from '@svgr/rollup'
import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { checker } from 'vite-plugin-checker'
import { VitePWA } from 'vite-plugin-pwa'

const scope = process.env['npm_package_scripts_build']?.includes('testing')
  ? 'https://www.yiwen.ltd'
  : 'https://www.yiwen.ai'
const cdnPrefix =
  scope === 'https://www.yiwen.ltd'
    ? 'https://cdn.yiwen.pub/dev/web/'
    : 'https://cdn.yiwen.pub/web/'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({ babel: { rootMode: 'upward', configFile: true } }),
    legacy(),
    checker({ typescript: true }),
    svgr({ ref: true, titleProp: true }),
    VitePWA({
      scope,
      buildBase: cdnPrefix,
      injectRegister: null,
      registerType: 'autoUpdate',
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        globPatterns: [
          '**/*.{js,css,html,txt,webmanifest,svg,png,jpg,jpeg,ico,ttf,woff2,woff}',
        ],
        modifyURLPrefix: {
          '': cdnPrefix,
        },
      },
      devOptions: {
        enabled: true,
      },
      includeManifestIcons: true,
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
            'src': cdnPrefix + 'favicon-64x64.png',
            'sizes': '64x64',
            'type': 'image/png',
          },
          {
            'src': cdnPrefix + 'favicon-192x192.png',
            'sizes': '192x192',
            'type': 'image/png',
          },
          {
            'src': cdnPrefix + 'favicon-512x512.png',
            'sizes': '512x512',
            'type': 'image/png',
            'purpose': 'any',
          },
          {
            'src': cdnPrefix + 'favicon-512x512-maskable.png',
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
