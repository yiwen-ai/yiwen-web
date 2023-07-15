import { createUseLogger } from './logging'

export const useLogger = createUseLogger<{
  'failed to create channel': { error: unknown }
}>()

export type Logger = ReturnType<typeof useLogger>
