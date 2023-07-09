import { useMemo } from 'react'
import useSWR from 'swr'
import { useFetcher, useFetcherConfig } from './useFetcher'

export interface AccessToken {
  token: string
  expiresAt: number
}

export function useAccessToken(): AccessToken | undefined {
  const { AUTH_URL } = useFetcherConfig()
  const { data } = useSWR<string>('/access_token', useFetcher(AUTH_URL))

  return useMemo<AccessToken | undefined>(() => {
    if (!data) return undefined
    return {
      token: data,
      // TODO: fix this
      expiresAt: Date.now() + 1000 * 60 * 60 * 24,
    }
  }, [data])
}
