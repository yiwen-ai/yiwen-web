import { createRoot } from 'react-dom/client'
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
