import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useMemo,
} from 'react'

export enum LoggingLevel {
  DEBUG = 10,
  INFO = 20,
  WARN = 30,
  ERROR = 40,
  FATAL = 50,
}

interface LoggingRecord<T extends string = string, P = unknown> {
  level: LoggingLevel
  message: T
  parameters: P
  timestamp: number
}

export interface LoggingHandler {
  publish(record: LoggingRecord): void
  close(): void
}

class Logger<T extends Record<string, unknown>> {
  constructor(protected handler: LoggingHandler) {}

  debug<K extends keyof T & string>(message: K, parameters: T[K]) {
    this.handler.publish({
      level: LoggingLevel.DEBUG,
      message,
      parameters,
      timestamp: Date.now(),
    })
  }

  info<K extends keyof T & string>(message: K, parameters: T[K]) {
    this.handler.publish({
      level: LoggingLevel.INFO,
      message,
      parameters,
      timestamp: Date.now(),
    })
  }

  warn<K extends keyof T & string>(message: K, parameters: T[K]) {
    this.handler.publish({
      level: LoggingLevel.WARN,
      message,
      parameters,
      timestamp: Date.now(),
    })
  }

  error<K extends keyof T & string>(message: K, parameters: T[K]) {
    this.handler.publish({
      level: LoggingLevel.ERROR,
      message,
      parameters,
      timestamp: Date.now(),
    })
  }

  fatal<K extends keyof T & string>(message: K, parameters: T[K]) {
    this.handler.publish({
      level: LoggingLevel.FATAL,
      message,
      parameters,
      timestamp: Date.now(),
    })
  }
}

const LoggerContext = createContext<Logger<Record<string, unknown>>>(
  new Logger({
    publish: () => undefined,
    close: () => undefined,
  })
)

interface LoggerProviderProps extends React.PropsWithChildren {
  handler: LoggingHandler
}

export function LoggerProvider({ handler, ...props }: LoggerProviderProps) {
  const logger = useMemo(() => new Logger(handler), [handler])
  useEffect(() => () => handler.close(), [handler])
  return createElement(LoggerContext.Provider, { ...props, value: logger })
}

export function createUseLogger<T extends Record<string, unknown>>() {
  return function useLogger() {
    const logger = useContext(LoggerContext)
    return logger as Logger<T>
  }
}
