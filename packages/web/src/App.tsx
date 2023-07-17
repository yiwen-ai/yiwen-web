import {
  AccountManager,
  Footer,
  GlobalStyles,
  Header,
  ThemeProvider,
  useUserTheme,
} from '@yiwen-ai/component'
import {
  FetcherConfigProvider,
  useUser,
  type FetcherConfig,
} from '@yiwen-ai/store'
import {
  LoggerProvider,
  LoggingLevel,
  resolveURL,
  type LoggingHandler,
} from '@yiwen-ai/util'
import { useCallback, useMemo, useState } from 'react'
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary'
import {
  IntlProvider,
  MissingTranslationError,
  useIntl,
  type ResolvedIntlConfig,
} from 'react-intl'
import {
  Outlet,
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from 'react-router-dom'
import useIsomorphicLayoutEffect from 'use-isomorphic-layout-effect'
import { useLogger } from './logger'
import Home from './routes/Home'
import LoginState from './routes/LoginState'
import NotFound from './routes/NotFound'
import Publication from './routes/Publication'

const DEFAULT_LOCALE = 'zh-CN'

function Fallback(props: FallbackProps) {
  const intl = useIntl()

  // TODO: show a better fallback UI
  // TODO: add a button to refresh the page
  return (
    <div>
      <h1>{intl.formatMessage({ defaultMessage: '出错了，请稍后再试' })}</h1>
      <pre>{props.error.message}</pre>
    </div>
  )
}

function Layout() {
  const logger = useLogger()
  const intl = useIntl()

  const onError = useCallback(
    (error: Error, { componentStack }: { componentStack: string }) => {
      logger.fatal('component error', { error, stack: componentStack })
    },
    [logger]
  )

  const renderAccount = useCallback(() => {
    return (
      <AccountManager
        str={{
          login: intl.formatMessage({
            defaultMessage: '登录',
          }),
          loginTitle: intl.formatMessage({
            defaultMessage: '登录到 yiwen.ai',
          }),
          githubLogin: intl.formatMessage({
            defaultMessage: '使用 GitHub 登录',
          }),
          githubLoginInProgress: intl.formatMessage({
            defaultMessage: '使用 GitHub 登录中…',
          }),
        }}
      />
    )
  }, [intl])

  return (
    <ErrorBoundary FallbackComponent={Fallback} onError={onError}>
      <GlobalStyles />
      <Header
        title={intl.formatMessage({ defaultMessage: '亿文' })}
        menu={[
          { to: 'p/test111', label: 'P #111' },
          { to: 'p/test222', label: 'P #222' },
          { to: 'ptest404', label: 'P #404' },
        ]}
        renderAccount={renderAccount}
      />
      <main>
        <Outlet />
      </main>
      <Footer />
    </ErrorBoundary>
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
  const fetcherConfig = useMemo<FetcherConfig>(
    () => ({
      PUBLIC_PATH: resolveURL(import.meta.env.BASE_URL),
      API_URL: resolveURL(import.meta.env.VITE_API_URL),
      AUTH_URL: resolveURL(import.meta.env.VITE_AUTH_URL),
    }),
    []
  )

  const loggingHandler = useMemo<LoggingHandler>(
    () => ({
      publish: (record) => {
        if (import.meta.env.DEV) {
          switch (record.level) {
            case LoggingLevel.DEBUG:
              // TODO: enable debug logging based on feature flag
              break
            case LoggingLevel.INFO:
              console.info(record) // eslint-disable-line no-console
              break
            case LoggingLevel.WARN:
              console.warn(record) // eslint-disable-line no-console
              break
            case LoggingLevel.ERROR:
            case LoggingLevel.FATAL:
              console.error(record) // eslint-disable-line no-console
              break
          }
        } else {
          // TODO: publish to telemetry service
        }
      },
      close: () => {
        // TODO: close telemetry service
      },
    }),
    []
  )

  return (
    <FetcherConfigProvider value={fetcherConfig}>
      <LoggerProvider handler={loggingHandler}>
        <UserLocaleProvider>
          <UserThemeProvider>
            <RouterProvider router={router} />
            <LoggingUnhandledError />
          </UserThemeProvider>
        </UserLocaleProvider>
      </LoggerProvider>
    </FetcherConfigProvider>
  )
}

function UserLocaleProvider(props: React.PropsWithChildren) {
  const [user] = useUser()
  const locale = user?.locale || window.navigator.language
  // TODO: load messages based on locale
  const [messages] = useState({})
  // TODO: update html lang attribute based on locale (and direction)

  const logger = useLogger()
  const onError = useCallback<ResolvedIntlConfig['onError']>(
    (error) => {
      if (import.meta.env.DEV) return
      if (error instanceof MissingTranslationError) {
        logger.warn('missing translation', {
          key: error.descriptor?.id,
          locale,
          error,
        })
      } else {
        logger.error('failed to format', { locale, error })
      }
    },
    [locale, logger]
  )

  return (
    <IntlProvider
      messages={messages}
      locale={locale}
      defaultLocale={DEFAULT_LOCALE}
      onError={onError}
    >
      {props.children}
    </IntlProvider>
  )
}

function UserThemeProvider(props: React.PropsWithChildren) {
  const [theme] = useUserTheme() // wait for user theme to be loaded
  return <ThemeProvider theme={theme}>{props.children}</ThemeProvider>
}

function LoggingUnhandledError() {
  const logger = useLogger()

  useIsomorphicLayoutEffect(() => {
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
