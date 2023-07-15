import { type FetcherConfig } from '@yiwen-ai/store'
import { LoggingLevel, resolveURL, type LoggingHandler } from '@yiwen-ai/util'
import { useMemo } from 'react'

interface Config {
  fetcher: FetcherConfig
  loggingHandler: LoggingHandler
}

export default function useConfig(): Config {
  const fetcher = useMemo<FetcherConfig>(
    () => ({
      PUBLIC_PATH: resolveURL(import.meta.env.BASE_URL),
      API_URL: resolveURL(import.meta.env.VITE_API_URL),
      AUTH_URL: resolveURL(import.meta.env.VITE_AUTH_URL),
    }),
    []
  )

  const loggingHandler = useMemo<LoggingHandler>(
    () => ({
      publish: (record) => {
        if (import.meta.env.DEV) {
          switch (record.level) {
            case LoggingLevel.DEBUG:
              // TODO: enable debug logging based on feature flag
              break
            case LoggingLevel.INFO:
              console.info(record) // eslint-disable-line no-console
              break
            case LoggingLevel.WARN:
              console.warn(record) // eslint-disable-line no-console
              break
            case LoggingLevel.ERROR:
            case LoggingLevel.FATAL:
              console.error(record) // eslint-disable-line no-console
              break
          }
        } else {
          // TODO: publish to telemetry service
        }
      },
      close: () => {
        // TODO: close telemetry service
      },
    }),
    []
  )

  return {
    fetcher,
    loggingHandler,
  }
}
