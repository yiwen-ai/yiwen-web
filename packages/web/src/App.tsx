import { css, useTheme } from '@emotion/react'
import {
  Button,
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
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { SWRConfig, type SWRConfiguration } from 'swr'
import Loading from './components/Loading'
import { useLogger } from './logger'
import Home from './pages'
import NotFound from './pages/404'
import CollectionPage from './pages/collection'
import EditCreationPage from './pages/creation/[cid]'
import NewCreationPage from './pages/creation/new'
import GroupDetailPage from './pages/group/[gid]'
import DefaultGroupPage from './pages/group/default'
import LoginStatePage from './pages/login/state'
import SharePublicationPage from './pages/pub/[cid]'
import EditPublicationPage from './pages/publication/[cid]'
import SearchPage from './pages/search'
import { BREAKPOINT } from './shared'

function Fallback({
  onRefresh,
  ...props
}: FallbackProps & {
  onRefresh: () => void
}) {
  const intl = useIntl()
  const theme = useTheme()

  // TODO: show a better fallback UI
  // TODO: add a button to refresh the page
  return (
    <div
      css={css`
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 80px;
        @media (max-width: ${BREAKPOINT.small}px) {
          padding-left: 40px;
          padding-right: 40px;
        }
      `}
    >
      <h1>{intl.formatMessage({ defaultMessage: '出错了，请稍后再试' })}</h1>
      <pre
        css={css`
          margin: 40px 0;
          ${theme.typography.tooltip}
          color: ${theme.color.body.secondary};
          white-space: pre-wrap;
          word-break: break-all;
        `}
      >
        <code>{props.error.message}</code>
      </pre>
      <Button color='secondary' onClick={onRefresh}>
        {intl.formatMessage({ defaultMessage: '刷新' })}
      </Button>
    </div>
  )
}

function Layout() {
  const logger = useLogger()
  const intl = useIntl()
  const navigate = useNavigate()

  //#region close auth dialog on location change
  const location = useLocation()
  const closeAuthDialog = useAuth().dialog.close
  useEffect(() => closeAuthDialog(), [closeAuthDialog, location])
  //#endregion

  //#region error boundary
  const [key, setKey] = useState(0)

  const renderFallback = useCallback(
    (props: FallbackProps) => (
      <Fallback {...props} onRefresh={() => setKey((key) => key + 1)} />
    ),
    []
  )

  const onError = useCallback<NonNullable<ErrorBoundaryProps['onError']>>(
    (error, { componentStack }) => {
      logger.fatal('component error', { error, stack: componentStack })
    },
    [logger]
  )
  //#endregion

  //#region header
  const [headerProps, setHeaderProps] = useState<HeaderProps>({})

  const userMenu = useMemo<MenuProps>(
    () => ({
      items: [
        {
          label: intl.formatMessage({ defaultMessage: '我的资料' }),
          style: { display: 'none' },
        },
        {
          label: intl.formatMessage({ defaultMessage: '创作中心' }),
          onClick: () => navigate(DEFAULT_GROUP_PATH),
        },
        {
          label: intl.formatMessage({ defaultMessage: '我的收藏' }),
          onClick: () => navigate(COLLECTION_PATH),
        },
        {
          label: intl.formatMessage({ defaultMessage: '我的订阅' }),
          style: { display: 'none' },
        },
      ],
    }),
    [intl, navigate]
  )
  //#endregion

  return (
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
          <ErrorBoundary
            key={key}
            fallbackRender={renderFallback}
            onError={onError}
          >
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>
    </SetHeaderPropsContext.Provider>
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
export const COLLECTION_PATH = '/collection'
export const NEW_CREATION_PATH = '/creation/new'
export const EDIT_CREATION_PATH = '/creation/:cid'
export const EDIT_PUBLICATION_PATH = '/publication/:cid'
export const SHARE_PUBLICATION_PATH = '/pub/:cid'
export const DEFAULT_GROUP_PATH = '/group/default'
export const GROUP_DETAIL_PATH = '/group/:gid'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Layout />}>
      <Route path='*' element={<NotFound />} />
      <Route path='/' element={<Home />} />
      <Route path='/login/state' element={<LoginStatePage />} />
      <Route path={SEARCH_PATH} element={<SearchPage />} />
      <Route path={COLLECTION_PATH} element={<CollectionPage />} />
      <Route path={NEW_CREATION_PATH} element={<NewCreationPage />} />
      <Route path={EDIT_CREATION_PATH} element={<EditCreationPage />} />
      <Route path={EDIT_PUBLICATION_PATH} element={<EditPublicationPage />} />
      <Route path={SHARE_PUBLICATION_PATH} element={<SharePublicationPage />} />
      <Route path={DEFAULT_GROUP_PATH} element={<DefaultGroupPage />} />
      <Route path={GROUP_DETAIL_PATH} element={<GroupDetailPage />} />
    </Route>
  ),
  { basename: new URL(resolveURL(import.meta.env.VITE_PUBLIC_PATH)).pathname }
)

export default function App() {
  const fetcherConfig = useMemo<FetcherConfig>(
    () => ({
      PUBLIC_PATH: resolveURL(import.meta.env.VITE_PUBLIC_PATH),
      API_URL: resolveURL(import.meta.env.VITE_API_URL),
      AUTH_URL: resolveURL(import.meta.env.VITE_AUTH_URL),
      SHARE_URL: resolveURL(import.meta.env.VITE_SHARE_URL),
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
