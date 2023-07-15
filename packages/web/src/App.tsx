import {
  Footer,
  GlobalStyles,
  Header,
  ThemeProvider,
} from '@yiwen-ai/component'
import { FetcherConfigProvider } from '@yiwen-ai/store'
import { LoggerProvider, useUserTheme } from '@yiwen-ai/util'
import { useCallback, useLayoutEffect } from 'react'
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary'
import {
  Outlet,
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from 'react-router-dom'
import useConfig from './config'
import { useLogger } from './logger'
import Home from './routes/Home'
import LoginState from './routes/LoginState'
import NotFound from './routes/NotFound'
import Publication from './routes/Publication'

function Fallback(props: FallbackProps) {
  // TODO: show a better fallback UI
  return (
    <div>
      <h1>Something went wrong.</h1>
      <pre>{props.error.message}</pre>
    </div>
  )
}

function Layout() {
  const [theme] = useUserTheme()
  const logger = useLogger()

  const onError = useCallback(
    (error: Error, { componentStack }: { componentStack: string }) => {
      logger.fatal('component error', { error, stack: componentStack })
    },
    [logger]
  )

  return (
    <ThemeProvider theme={theme}>
      <ErrorBoundary FallbackComponent={Fallback} onError={onError}>
        <GlobalStyles />
        <Header
          title="亿文"
          menu={[
            { to: 'p/test111', label: 'P #111' },
            { to: 'p/test222', label: 'P #222' },
            { to: 'ptest404', label: 'P #404' },
          ]}
        />
        <main>
          <Outlet />
        </main>
        <Footer />
      </ErrorBoundary>
    </ThemeProvider>
  )
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Layout />}>
      <Route path="*" element={<NotFound />} />
      <Route path="/" element={<Home />} />
      <Route path="/p/:id" element={<Publication />} />
      <Route path="/login/state" element={<LoginState />} />
    </Route>
  ),
  { basename: import.meta.env.BASE_URL }
)

export default function App() {
  const config = useConfig()

  return (
    <LoggerProvider handler={config.loggingHandler}>
      <FetcherConfigProvider value={config.fetcher}>
        <RouterProvider router={router} />
        <LoggingUnhandledError />
      </FetcherConfigProvider>
    </LoggerProvider>
  )
}

function LoggingUnhandledError() {
  const logger = useLogger()

  useLayoutEffect(() => {
    const onError = (ev: ErrorEvent) => {
      logger.error('uncaught error', {
        message: ev.message,
        error: ev.error,
        filename: ev.filename,
        lineno: ev.lineno,
        colno: ev.colno,
      })
    }
    const onUnhandledRejection = (ev: PromiseRejectionEvent) => {
      logger.error('unhandled rejection', { error: ev.reason })
    }
    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onUnhandledRejection)
    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onUnhandledRejection)
    }
  }, [logger])

  return null
}
