import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById('root')!).render(<App />)

if ('serviceWorker' in navigator) {
  const scope = 'https://' + document.location.host
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(scope + '/sw.js', {
      scope,
    })
  })
}

const intervalMS = 60 * 60 * 1000

registerSW({
  // immediate: true,
  onRegisteredSW(swUrl: string, r) {
    r &&
      setInterval(async () => {
        if (!(!r.installing && navigator)) return

        if ('connection' in navigator && !navigator.onLine) return

        const resp = await fetch(swUrl, {
          cache: 'no-store',
          headers: {
            'cache': 'no-store',
            'cache-control': 'no-cache',
          },
        })

        if (resp?.status === 200) await r.update()
      }, intervalMS)
  },
})
