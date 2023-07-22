import { useCallback, useEffect, useState } from 'react'
import useSWR from 'swr'
import { useAuthFetcher } from './useFetcher'

export interface AccessToken {
  sub: string
  access_token: string
  /**
   * 默认有效期为 1 小时 (3600s)
   */
  expires_in: number
}

/**
 * https://github.com/yiwen-ai/auth-api/blob/main/doc/api.md#%E7%99%BB%E5%BD%95%E6%88%90%E5%8A%9F%E8%8E%B7%E5%8F%96-access_token
 */
export function useAccessToken() {
  const [refreshInterval, setRefreshInterval] = useState(1 * 60 * 60) // 1 小时 (3600s)
  const { data, mutate } = useSWR<AccessToken>('/access_token', {
    fetcher: useAuthFetcher(),
    refreshInterval: refreshInterval * 1000,
  })
  useEffect(
    () => setRefreshInterval((prev) => data?.expires_in ?? prev),
    [data?.expires_in]
  )
  const refresh = useCallback(() => mutate(), [mutate])
  return {
    accessToken: data?.access_token,
    refresh,
  }
}
