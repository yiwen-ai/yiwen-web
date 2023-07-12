import { useCallback } from 'react'
import useSWR from 'swr'
import { useFetcher, useFetcherConfig } from './useFetcher'

export type ColorScheme = 'light' | 'dark' | 'auto'

export interface User {
  name: string
  picture: string // TODO: check
  theme?: ColorScheme
}

export function useUser() {
  const { AUTH_URL } = useFetcherConfig()
  const { data, error, mutate } = useSWR<User>(
    '/userinfo',
    useFetcher(AUTH_URL),
    { revalidateOnFocus: false, shouldRetryOnError: false }
  )
  const refresh = useCallback(() => mutate(), [mutate])
  return [error ? undefined : data, refresh] as const
}
