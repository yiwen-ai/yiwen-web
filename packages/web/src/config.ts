import { type FetcherConfig } from '@yiwen-ai/store'
import { resolveURL } from '@yiwen-ai/util'
import { useMemo } from 'react'

interface Config {
  fetcher: FetcherConfig
}

export default function useConfig() {
  return useMemo<Config>(() => {
    return {
      fetcher: {
        PUBLIC_PATH: resolveURL(import.meta.env.BASE_URL),
        API_URL: resolveURL(import.meta.env.VITE_API_URL),
        AUTH_URL: resolveURL(import.meta.env.VITE_AUTH_URL),
      },
    }
  }, [])
}
