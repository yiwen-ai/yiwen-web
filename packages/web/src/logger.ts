import { createUseLogger } from '@yiwen-ai/util'

export const useLogger = createUseLogger<{
  'component error': { error: Error; stack: string }
  'uncaught error': Omit<ErrorEvent, keyof Event>
  'unhandled rejection': { error: unknown }
}>()

export type Logger = ReturnType<typeof useLogger>
