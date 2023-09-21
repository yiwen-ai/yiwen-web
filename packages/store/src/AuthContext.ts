import {
  Channel,
  createAction,
  isWindow,
  joinURL,
  useIsMounted,
  type ModalRef,
} from '@yiwen-ai/util'
import {
  createContext,
  createElement,
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
  finalize,
  from,
  tap,
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
    return this.request<UserInfo>('/userinfo', undefined, { signal })
  }

  fetchAccessToken(signal: AbortSignal | null) {
    return this.request<AccessToken>('/access_token', undefined, { signal })
  }

  private authentication = createAction<{ status: number }>('__AUTH_CALLBACK__')

  authorize(provider: IdentityProvider) {
    return new Observable<void>((observer) => {
      const { AUTH_URL, PUBLIC_PATH } = this.config
      const app =
        document.documentElement.attributes.getNamedItem('data-app')?.value
      let idp = provider
      if (app == 'wechat' && idp == 'wechat') {
        idp = 'wechat_h5'
      }
      const url = joinURL(AUTH_URL, `/idp/${idp}/authorize`, {
        next_url: joinURL(PUBLIC_PATH, '/login/state', { provider }),
      })

      const popup = window.open(
        url,
        'YiwenAILogin',
        'popup=true,width=600,height=600,menubar=false,toolbar=false,location=false'
      )
      if (!popup) {
        const url = joinURL(AUTH_URL, `/idp/${idp}/authorize`, {
          next_url: document.location.href,
        })
        window.location.assign(url) // redirect if popup is blocked
        return
      }
      const channel = new Channel(popup)
      const following = from(channel).subscribe((action) => {
        if (!this.authentication.match(action)) return
        if (action.payload.status >= 200 && action.payload.status < 300) {
          observer.next()
          observer.complete()
        } else {
          // TODO: failed to authorize, handle error
          // show error message
          observer.error(action.payload)
        }
      })
      return () => {
        following.unsubscribe()
        channel.close()
        popup.close()
      }
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

  useEffect(() => {
    const followingList = new Set<Subscription>()
    const authorize = (provider: IdentityProvider) => {
      setState((state) => ({ ...state, authorizingProvider: provider }))
      const following = authAPI
        .authorize(provider)
        .pipe(
          concatMap(() => {
            return new Observable<void>((observer) => {
              const controller = new AbortController()
              from(refresh(authAPI, controller.signal)).subscribe(observer)
              return () => controller.abort()
            })
          }),
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
            followingList.delete(following)
          })
        )
        .subscribe()
      followingList.add(following)
    }
    const callback = authAPI.callback.bind(authAPI)
    const logout = () => {
      const following = from(authAPI.logout())
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
            followingList.delete(following)
          })
        )
        .subscribe()
      followingList.add(following)
    }
    setState((state) => ({ ...state, authorize, callback, logout }))
    return () => {
      followingList.forEach((following) => following.unsubscribe())
      followingList.clear()
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
