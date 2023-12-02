import { clientsClaim, type WorkboxPlugin } from 'workbox-core'
import { ExpirationPlugin } from 'workbox-expiration'
import { initialize as googleAnalytics } from 'workbox-google-analytics'
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import {
  CacheFirst,
  NetworkFirst,
  StaleWhileRevalidate,
} from 'workbox-strategies'

declare let self: ServiceWorkerGlobalScope

self.skipWaiting()
clientsClaim()
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()
googleAnalytics()

registerRoute(
  new RegExp('https://cdn\\.yiwen\\.pub/.*'),
  new CacheFirst({
    cacheName: 'cdn-res',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 1000,
        maxAgeSeconds: 7 * 24 * 60 * 60,
      }) as WorkboxPlugin,
    ],
  })
)

const wwwCapture = self.location.hostname.includes('.ai')
  ? 'https://www\\.yiwen\\.ai.*'
  : 'https://www\\.yiwen\\.ltd.*'

registerRoute(
  new RegExp(wwwCapture),
  new StaleWhileRevalidate({
    cacheName: 'html-res',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 7 * 24 * 60 * 60,
      }) as WorkboxPlugin,
    ],
  })
)

const apiCapture = self.location.hostname.includes('.ai')
  ? 'https://(api|wallet|auth)\\.yiwen\\.ai/.*'
  : 'https://(api|wallet|auth)\\.yiwen\\.ltd/.*'

registerRoute(
  new RegExp(apiCapture),
  new NetworkFirst({
    cacheName: 'api-res',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100000,
        maxAgeSeconds: 1 * 24 * 60 * 60,
      }) as WorkboxPlugin,
    ],
  })
)

const apiPostCapture = self.location.hostname.includes('.ai')
  ? 'https://(api|wallet)\\.yiwen\\.ai/.*/list.*'
  : 'https://(api|wallet)\\.yiwen\\.ltd/.*/list.*'

registerRoute(
  new RegExp(apiPostCapture),
  new NetworkFirst({
    cacheName: 'api-res',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100000,
        maxAgeSeconds: 3 * 24 * 60 * 60,
      }) as WorkboxPlugin,
    ],
  }),
  'POST'
)
