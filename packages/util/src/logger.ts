import { createUseLogger } from './logging'

export const useLogger = createUseLogger<Record<string, unknown>>()

export type Logger = ReturnType<typeof useLogger>
