import { createContext, useCallback, useContext } from 'react'

export interface FetcherConfig {
  API_URL: string
  AUTH_URL: string
}

const FetcherConfigContext = createContext<FetcherConfig>({
  API_URL: 'https://api.yiwen.ai/',
  AUTH_URL: 'https://auth.yiwen.ai/',
})

export const FetcherConfigProvider = FetcherConfigContext.Provider

export function useFetcherConfig() {
  return useContext(FetcherConfigContext)
}

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'

export function useFetcher(baseURL?: string) {
  const { API_URL } = useFetcherConfig()

  return useCallback(
    async (url: string, method: Method = 'GET') => {
      const resp = await fetch(new URL(url, baseURL ?? API_URL), {
        method,
        headers: {
          // TODO: add auth header
        },
        credentials: 'include', // TODO: remove this
      })
      return resp.json()
    },
    [API_URL, baseURL]
  )
}
