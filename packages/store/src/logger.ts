import { createUseLogger } from '@yiwen-ai/util'

export const useLogger = createUseLogger<{
  'fetch error': {
    url: string
    status: number
    error: unknown
    requestId: string | null
  }
  'fetcher config is not ready': { config: unknown }
  'fetcher is not ready': { url: string }
}>()

export type Logger = ReturnType<typeof useLogger>
