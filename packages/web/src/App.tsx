import { css } from '@emotion/react'
import {
  DEFAULT_LOCALE,
  GlobalStyles,
  Header,
  LocaleProvider,
  ThemeProvider,
  useUserTheme,
  type HeaderProps,
  type MenuProps,
} from '@yiwen-ai/component'
import {
  AuthProvider,
  FetcherConfigProvider,
  useAuth,
  useMyDefaultGroup,
  type FetcherConfig,
} from '@yiwen-ai/store'
import {
  LoggerProvider,
  LoggingLevel,
  resolveURL,
  useLayoutEffect,
  type LoggingHandler,
} from '@yiwen-ai/util'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  ErrorBoundary,
  type ErrorBoundaryProps,
  type FallbackProps,
} from 'react-error-boundary'
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
  generatePath,
  useNavigate,
} from 'react-router-dom'
import { SWRConfig, type SWRConfiguration } from 'swr'
import { Xid } from 'xid-ts'
import Loading from './components/Loading'
import { useLogger } from './logger'
import Home from './pages'
import NotFound from './pages/404'
import NewCreation from './pages/creation/new'
import GroupDetail from './pages/group/[id]'
import LoginState from './pages/login/state'
import PublicationDetail from './pages/publication/[id]'
import Search from './pages/search'

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
  const navigate = useNavigate()

  const onError = useCallback<NonNullable<ErrorBoundaryProps['onError']>>(
    (error, { componentStack }) => {
      logger.fatal('component error', { error, stack: componentStack })
    },
    [logger]
  )

  const [headerProps, setHeaderProps] = useState<HeaderProps>({})

  const gid = useMyDefaultGroup()?.id
  const userMenu = useMemo<MenuProps>(
    () => ({
      items: [
        {
          label: intl.formatMessage({ defaultMessage: '我的资料' }),
        },
        {
          label: intl.formatMessage({ defaultMessage: '我的创作中心' }),
          disabled: !gid,
          onClick: () => {
            if (!gid) return
            navigate(
              generatePath(GROUP_DETAIL_PATH, {
                id: Xid.fromValue(gid).toString(),
              })
            )
          },
        },
        {
          label: intl.formatMessage({ defaultMessage: '我的收藏' }),
        },
        {
          label: intl.formatMessage({ defaultMessage: '我的订阅' }),
        },
      ],
    }),
    [gid, intl, navigate]
  )

  return (
    <ErrorBoundary FallbackComponent={Fallback} onError={onError}>
      <SetHeaderPropsContext.Provider value={setHeaderProps}>
        <main
          css={css`
            height: 100vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          `}
        >
          <Header {...headerProps} userMenu={userMenu} />
          <div
            css={css`
              flex: 1;
              display: flex;
              flex-direction: column;
              overflow-y: auto;
            `}
          >
            <Outlet />
          </div>
        </main>
      </SetHeaderPropsContext.Provider>
    </ErrorBoundary>
  )
}

const SetHeaderPropsContext = createContext<(props: HeaderProps) => void>(
  () => undefined
)

export function SetHeaderProps(props: HeaderProps) {
  const setHeaderProps = useContext(SetHeaderPropsContext)
  useEffect(() => {
    setHeaderProps(props)
    return () => setHeaderProps({})
  }, [props, setHeaderProps])
  return null
}

export const SEARCH_PATH = '/search'
export const NEW_CREATION_PATH = '/creation/new'
export const PUBLICATION_DETAIL_PATH = '/publication/:id'
export const GROUP_DETAIL_PATH = '/group/:id'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Layout />}>
      <Route path='*' element={<NotFound />} />
      <Route path='/' element={<Home />} />
      <Route path={SEARCH_PATH} element={<Search />} />
      <Route path={NEW_CREATION_PATH} element={<NewCreation />} />
      <Route path={GROUP_DETAIL_PATH} element={<GroupDetail />} />
      <Route path={PUBLICATION_DETAIL_PATH} element={<PublicationDetail />} />
      <Route path='/login/state' element={<LoginState />} />
    </Route>
  ),
  { basename: import.meta.env.VITE_PUBLIC_PATH }
)

export default function App() {
  const fetcherConfig = useMemo<FetcherConfig>(
    () => ({
      PUBLIC_PATH: resolveURL(import.meta.env.VITE_PUBLIC_PATH),
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

  const swrConfig = useMemo<SWRConfiguration>(
    () => ({
      revalidateIfStale: false,
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }),
    []
  )

  return (
    <FetcherConfigProvider value={fetcherConfig}>
      <LoggerProvider handler={loggingHandler}>
        <SWRConfig value={swrConfig}>
          <AuthProvider
            fallback={
              <UserThemeProvider>
                <Loading
                  css={css`
                    position: absolute;
                    inset: 0;
                  `}
                />
              </UserThemeProvider>
            }
          >
            <UserLocaleProvider>
              <UserThemeProvider>
                <GlobalStyles />
                <RouterProvider router={router} />
                <LoggingUnhandledError />
              </UserThemeProvider>
            </UserLocaleProvider>
          </AuthProvider>
        </SWRConfig>
      </LoggerProvider>
    </FetcherConfigProvider>
  )
}

function UserLocaleProvider(props: React.PropsWithChildren) {
  const { user } = useAuth()
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
      <LocaleProvider locale={locale} onError={onError}>
        {props.children}
      </LocaleProvider>
    </IntlProvider>
  )
}

function UserThemeProvider(props: React.PropsWithChildren) {
  const [theme] = useUserTheme() // wait for user theme to be loaded
  return <ThemeProvider theme={theme}>{props.children}</ThemeProvider>
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
