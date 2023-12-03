import { clientsClaim, type WorkboxPlugin } from 'workbox-core'
import { ExpirationPlugin } from 'workbox-expiration'
import { initialize as googleAnalytics } from 'workbox-google-analytics'
import {
  cleanupOutdatedCaches,
  matchPrecache,
  precacheAndRoute,
  PrecacheController,
} from 'workbox-precaching'
import { registerRoute, setCatchHandler } from 'workbox-routing'
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

const indexHtmlUrl = new PrecacheController()
  .getCachedURLs()
  .find((url: string) => url.endsWith('index.html'))
console.log('Yiwen index', indexHtmlUrl)

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
        maxAgeSeconds: 3 * 24 * 60 * 60,
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
        maxAgeSeconds: 3 * 24 * 60 * 60,
      }) as WorkboxPlugin,
    ],
  })
)

if (indexHtmlUrl) {
  setCatchHandler(async ({ request }) => {
    let res: Response | undefined
    switch (request.destination) {
      case 'document':
        res = await matchPrecache(indexHtmlUrl)
      // case 'image':
      //   return matchPrecache(FALLBACK_IMAGE_URL)
    }

    return res || Response.error()
  })
}
