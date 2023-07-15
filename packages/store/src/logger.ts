import { createUseLogger } from '@yiwen-ai/util'

export const useLogger = createUseLogger<{
  'fetch error': { url: string; status: number; error: unknown }
  'missing access token': void
}>()

export type Logger = ReturnType<typeof useLogger>
