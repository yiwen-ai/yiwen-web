import { useCallback } from 'react'
import useSWR from 'swr'
import { useAuthFetcher } from './useFetcher'

export enum UserStatus {
  Disabled = -2,
  Suspended = -1,
  Normal = 0,
  Verified = 1,
  Protected = 2,
}

export type ColorScheme = 'light' | 'dark' | 'auto'

export interface User {
  cn: string
  name: string
  locale: string
  picture: string
  status: UserStatus
  theme?: ColorScheme
}

/**
 * https://github.com/yiwen-ai/auth-api/blob/main/doc/api.md#%E7%99%BB%E5%BD%95%E6%88%90%E5%8A%9F%E8%8E%B7%E5%8F%96%E7%94%A8%E6%88%B7%E4%BF%A1%E6%81%AF
 */
export function useUser() {
  const { data, isLoading, mutate } = useSWR<User>(
    '/userinfo',
    useAuthFetcher() ?? null
  )
  const refresh = useCallback(() => mutate(), [mutate])
  return {
    user: data,
    isLoading,
    refresh,
  }
}
