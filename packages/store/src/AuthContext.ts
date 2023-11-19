import {
  Channel,
  createAction,
  isWindow,
  joinURL,
  useIsMounted,
  waitUntilClosed,
  type ModalRef,
} from '@yiwen-ai/util'
import {
  createContext,
  createElement,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  EMPTY,
  Observable,
  catchError,
  concatMap,
  filter,
  finalize,
  from,
  merge,
  take,
  takeUntil,
  tap,
  timer,
  type Subscription,
} from 'rxjs'
import { type UserInfo } from './common'
import { useLogger } from './logger'
import {
  createRequest,
  useFetcherConfig,
  type FetcherConfig,
} from './useFetcher'

interface AccessToken {
  sub: string
  access_token: string
  /**
   * 默认有效期为 1 小时 (3600s)
   */
  expires_in: number
}

export type IdentityProvider = 'github' | 'google' | 'wechat' | 'wechat_h5'

class AuthAPI {
  private request: ReturnType<typeof createRequest>

  constructor(
    private logger: ReturnType<typeof useLogger>,
    private config: FetcherConfig
  ) {
    this.request = createRequest(this.logger, this.config.AUTH_URL, {
      credentials: 'include',
    })
  }

  fetchUser(signal: AbortSignal | null) {
    return this.request.get<UserInfo>('/userinfo', undefined, signal)
  }

  fetchAccessToken(signal: AbortSignal | null) {
    return this.request.get<AccessToken>('/access_token', undefined, signal)
  }

  private authentication = createAction<{ status: number }>('__AUTH_CALLBACK__')

  authorize(provider: IdentityProvider, signal: AbortSignal | null) {
    return new Observable<UserInfo>((observer) => {
      const { AUTH_URL, PUBLIC_PATH } = this.config
      const isInWechat = window.navigator.userAgent
        .toLowerCase()
        .includes('micromessenger/')

      if (isInWechat) {
        const idp = provider == 'wechat' ? 'wechat_h5' : provider
        const url = joinURL(AUTH_URL, `/idp/${idp}/authorize`, {
          next_url: document.location.href,
        })
        window.location.assign(url)
        return
      }

      const url = joinURL(AUTH_URL, `/idp/${provider}/authorize`, {
        next_url: joinURL(PUBLIC_PATH, '/login/state', { provider }),
      })

      const popup = window.open(
        url,
        'YiwenAILogin',
        'popup=true,width=600,height=600,menubar=false,toolbar=false,location=false'
      )
      if (!popup) {
        const url = joinURL(AUTH_URL, `/idp/${provider}/authorize`, {
          next_url: document.location.href,
        })
        window.location.assign(url) // redirect if popup is blocked
        return
      }

      return merge(
        timer(1000, 2000).pipe(takeUntil(waitUntilClosed(popup))),
        waitUntilClosed(popup)
      )
        .pipe(
          concatMap(async () => {
            try {
              return await this.fetchUser(signal)
            } catch (error) {
              if (popup.closed || signal?.aborted) {
                throw error
              } else {
                return undefined
              }
            }
          }),
          filter((user) => !!user),
          take(1),
          finalize(() => {
            popup.close()
          })
        )
        .subscribe(observer)
    })
  }

  callback(payload: { status: number }) {
    const { opener } = window
    if (isWindow(opener)) {
      const channel = new Channel(opener)
      channel
        .send(this.authentication(payload))
        .catch(() => {}) // ignore error
        .finally(() => channel.close())
    }
  }

  logout() {
    return this.request.post('/logout')
  }
}

interface State {
  isInitialized: boolean
  isAuthorized: boolean
  language: string
  user?: UserInfo | undefined
  accessToken?: string | undefined
  refreshInterval?: number | undefined
  dialog: ModalRef
  authorize: (provider: IdentityProvider) => void
  authorizingProvider?: IdentityProvider | undefined
  callback: (payload: { status: number }) => void
  logout: () => void
}

const Context = createContext<Readonly<State>>({
  isInitialized: false,
  isAuthorized: false,
  language: '',
  dialog: {
    open: false,
    show: () => {},
    close: () => {},
    toggle: () => {},
  },
  authorize: () => {},
  callback: () => {},
  logout: () => {},
})

export function useAuth() {
  return useContext(Context)
}

export const xLanguage = { current: '' }

export function setXLanguage(language: string) {
  xLanguage.current = language
}

export function useEnsureAuthorized() {
  const {
    isAuthorized,
    dialog: { show: showDialog },
  } = useAuth()

  return useCallback(
    <T extends (...args: never[]) => unknown>(callback: T) => {
      return (...args: Parameters<T>) => {
        if (isAuthorized) {
          return callback(...args) as ReturnType<T>
        } else {
          return showDialog() as undefined
        }
      }
    },
    [isAuthorized, showDialog]
  )
}

export function useEnsureAuthorizedCallback() {
  const {
    isAuthorized,
    dialog: { show: showDialog },
  } = useAuth()

  const createHandler = useCallback(
    <T extends React.SyntheticEvent>(callback?: (ev: T) => void) => {
      return (ev: T) => {
        if (isAuthorized) {
          callback?.(ev)
        } else {
          ev.preventDefault()
          ev.stopPropagation()
          showDialog()
        }
      }
    },
    [isAuthorized, showDialog]
  )

  return useCallback(
    <T extends React.SyntheticEvent>(ev: T | ((ev: T) => void)) => {
      if (typeof ev === 'function') {
        const callback = ev
        return createHandler(callback)
      } else {
        createHandler()(ev)
        return undefined
      }
    },
    [createHandler]
  )
}

export function authorized(
  children: React.ReactNode,
  fallback?: React.ReactNode
) {
  return createElement(function EnsureAuthorized() {
    const {
      isAuthorized,
      dialog: { show: showDialog },
    } = useAuth()

    useEffect(() => {
      if (!isAuthorized) showDialog()
    }, [isAuthorized, showDialog])

    return !isAuthorized && isValidElement(fallback) ? fallback : children
  })
}

export function AuthProvider(
  props: React.PropsWithChildren<{ fallback?: React.ReactNode }>
) {
  const logger = useLogger()
  const config = useFetcherConfig()
  const authAPI = useMemo(() => new AuthAPI(logger, config), [config, logger])
  const [state, setState] = useState(useAuth())
  const { isInitialized, refreshInterval } = state
  const isMounted = useIsMounted()

  const refresh = useCallback(
    async (authAPI: AuthAPI, signal: AbortSignal | null) => {
      try {
        const [user, { access_token, expires_in }] = await Promise.all([
          authAPI.fetchUser(signal),
          authAPI.fetchAccessToken(signal),
        ])
        isMounted() &&
          setState((state) => ({
            ...state,
            isAuthorized: true,
            user,
            accessToken: access_token,
            refreshInterval: expires_in,
          }))
      } catch {
        isMounted() &&
          setState((state) => ({
            ...state,
            isAuthorized: false,
            user: undefined,
            accessToken: undefined,
            refreshInterval: undefined,
          }))
      }
    },
    [isMounted]
  )

  const isLoadingRef = useRef(false)
  useEffect(() => {
    if (isLoadingRef.current) return
    isLoadingRef.current = true
    refresh(authAPI, null)
      .catch((error) => {
        // TODO: handle error
      })
      .finally(() => {
        if (!isMounted()) return
        setState((state) => ({ ...state, isInitialized: true }))
      })
  }, [authAPI, isMounted, refresh])

  useEffect(() => {
    if (!refreshInterval) return
    const controller = new AbortController()
    const timer = window.setInterval(() => {
      authAPI
        .fetchAccessToken(controller.signal)
        .then(({ access_token, expires_in }) => {
          setState((state) => ({
            ...state,
            accessToken: access_token,
            refreshInterval: expires_in,
          }))
        })
        .catch(() => {
          setState((state) => ({
            ...state,
            accessToken: undefined,
            refreshInterval: undefined,
          }))
        })
    }, refreshInterval * 1000)
    return () => {
      window.clearInterval(timer)
      controller.abort()
    }
  }, [authAPI, refreshInterval])

  const authorizingControllerRef = useRef<AbortController>()
  useEffect(() => () => authorizingControllerRef.current?.abort(), [])
  useEffect(() => {
    if (!state.dialog.open) authorizingControllerRef.current?.abort()
  }, [state.dialog.open])

  useEffect(() => {
    const subscriptionList = new Set<Subscription>()
    const authorize = (provider: IdentityProvider) => {
      const controller = new AbortController()
      authorizingControllerRef.current?.abort()
      authorizingControllerRef.current = controller
      setState((state) => ({ ...state, authorizingProvider: provider }))
      const subscription = authAPI
        .authorize(provider, controller.signal)
        .pipe(
          concatMap(() => refresh(authAPI, controller.signal)),
          tap(() => {
            setState((state) => ({
              ...state,
              dialog: { ...state.dialog, open: false },
              authorizingProvider: undefined,
            }))
          }),
          catchError((error) => {
            setState((state) => ({
              ...state,
              authorizingProvider: undefined,
            }))
            // TODO: handle error
            return EMPTY
          }),
          finalize(() => {
            controller.abort()
            if (authorizingControllerRef.current === controller) {
              authorizingControllerRef.current = undefined
            }
            subscriptionList.delete(subscription)
          })
        )
        .subscribe()
      subscriptionList.add(subscription)
    }
    const callback = authAPI.callback.bind(authAPI)
    const logout = () => {
      const subscription = from(authAPI.logout())
        .pipe(
          concatMap(() => {
            return new Observable<void>((observer) => {
              const controller = new AbortController()
              from(refresh(authAPI, controller.signal)).subscribe(observer)
              return () => controller.abort()
            })
          }),
          catchError((error) => {
            // TODO: handle error
            return EMPTY
          }),
          finalize(() => {
            subscriptionList.delete(subscription)
          })
        )
        .subscribe()
      subscriptionList.add(subscription)
    }
    setState((state) => ({ ...state, authorize, callback, logout }))
    return () => {
      subscriptionList.forEach((subscription) => subscription.unsubscribe())
      subscriptionList.clear()
    }
  }, [authAPI, refresh])

  useEffect(() => {
    const showDialog = () => {
      setState((state) => ({
        ...state,
        dialog: { ...state.dialog, open: true },
      }))
    }
    const closeDialog = () => {
      setState((state) => ({
        ...state,
        dialog: { ...state.dialog, open: false },
      }))
    }
    const toggleDialog = () => {
      setState((state) => ({
        ...state,
        dialog: { ...state.dialog, open: !state.dialog.open },
      }))
    }
    setState((state) => ({
      ...state,
      dialog: {
        ...state.dialog,
        show: showDialog,
        close: closeDialog,
        toggle: toggleDialog,
      },
    }))
  }, [])

  return createElement(
    Context.Provider,
    { value: state },
    isInitialized ? props.children : props.fallback
  )
}
