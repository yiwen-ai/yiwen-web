export function resolveURL(url: string) {
  return new URL(url, window.location.origin).href
}
