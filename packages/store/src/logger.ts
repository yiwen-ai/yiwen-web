import { createUseLogger } from '@yiwen-ai/util'

export const useLogger = createUseLogger<{
  'fetch error': { url: string; status: number; error: unknown }
  'fetcher config is not ready': { config: unknown }
  'fetcher is not ready': { url: string }
  'missing access token': void
}>()

export type Logger = ReturnType<typeof useLogger>
