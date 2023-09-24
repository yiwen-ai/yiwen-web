export function isURL(url: string) {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function isBlobURL(url: string | null | undefined): url is string {
  try {
    if (!url) return false
    const { protocol } = new URL(url)
    return protocol === 'blob:'
  } catch {
    return false
  }
}
