import { createUseLogger } from '@yiwen-ai/util'

export const useLogger = createUseLogger<{
  'failed to load icon': { error: unknown }
}>()

export type Logger = ReturnType<typeof useLogger>
