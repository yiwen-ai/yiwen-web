import { type FetcherConfig } from '@yiwen-ai/store'
import { useMemo } from 'react'

interface Config {
  fetcher: FetcherConfig
}

export default function useConfig() {
  return useMemo<Config>(() => {
    return {
      fetcher: {
        PUBLIC_PATH: import.meta.env.VITE_PUBLIC_PATH,
        API_URL: import.meta.env.VITE_API_URL,
        AUTH_URL: import.meta.env.VITE_AUTH_URL,
      },
    }
  }, [])
}
