import { createUseLogger } from '@yiwen-ai/util'

export const useLogger = createUseLogger<{
  'component error': { error: Error; stack: string }
  'failed to format': { locale: string; error: Error }
  'missing translation': {
    key: string | undefined
    locale: string
    error: Error
  }
  'uncaught error': Omit<ErrorEvent, keyof Event>
  'unhandled rejection': { error: unknown }
}>()

export type Logger = ReturnType<typeof useLogger>
