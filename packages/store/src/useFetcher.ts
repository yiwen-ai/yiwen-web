import { joinURL } from '@yiwen-ai/util'
import { createContext, useCallback, useContext } from 'react'

export interface FetcherConfig {
  PUBLIC_PATH: string
  API_URL: string
  AUTH_URL: string
}

const FetcherConfigContext = createContext({} as FetcherConfig)

export const FetcherConfigProvider = FetcherConfigContext.Provider

export function useFetcherConfig() {
  return useContext(FetcherConfigContext)
}

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'

export function useFetcher(baseURL?: string) {
  const { API_URL } = useFetcherConfig()

  return useCallback(
    async (url: string, method: Method = 'GET') => {
      const resp = await fetch(joinURL(baseURL ?? API_URL, url), {
        method,
        headers: {
          // TODO: add auth header
        },
        credentials: 'include', // TODO: remove this
      })
      if (resp.status >= 200 && resp.status < 300) {
        return resp.json()
      } else {
        throw await resp.json()
      }
    },
    [API_URL, baseURL]
  )
}
