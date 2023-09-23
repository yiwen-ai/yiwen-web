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
  'wechat error': { error: unknown }
}>()

export type Logger = ReturnType<typeof useLogger>
