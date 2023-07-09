import useSWR from 'swr'
import { useFetcher, useFetcherConfig } from './useFetcher'

export type ColorScheme = 'light' | 'dark' | 'auto'

export interface User {
  name: string
  theme?: ColorScheme
}

export function useUser() {
  const { AUTH_URL } = useFetcherConfig()
  const { data } = useSWR<User>('/userinfo', useFetcher(AUTH_URL))
  return [data] as const
}
