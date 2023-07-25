import svgr from '@svgr/rollup'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { checker } from 'vite-plugin-checker'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({ babel: { rootMode: 'upward', configFile: true } }),
    checker({ typescript: true }),
    svgr(),
  ],
})
