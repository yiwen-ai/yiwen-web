import { useCallback } from 'react'
import { useFetcherConfig } from './useFetcher'

export type IdentityProvider = 'github'

export function useAuthorize() {
  const { AUTH_URL } = useFetcherConfig()

  return useCallback(
    (provider: IdentityProvider) => {
      const url = new URL(`/idp/${provider}/authorize`, AUTH_URL)
      window.location.href = url.href
    },
    [AUTH_URL]
  )
}
