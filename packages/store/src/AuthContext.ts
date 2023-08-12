import { Channel, createAction, isWindow, joinURL } from '@yiwen-ai/util'
import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  EMPTY,
  Observable,
  catchError,
  concatMap,
  finalize,
  from,
  type Subscription,
} from 'rxjs'
import { useLogger } from './logger'
import {
  createRequest,
  useFetcherConfig,
  type FetcherConfig,
} from './useFetcher'

export enum UserStatus {
  Disabled = -2,
  Suspended = -1,
  Normal = 0,
  Verified = 1,
  Protected = 2,
}

export type ColorScheme = 'light' | 'dark' | 'auto'

export interface User {
  cn: string
  name: string
  locale: string
  picture: string
  status: UserStatus
  theme?: ColorScheme
}

interface AccessToken {
  sub: string
  access_token: string
  /**
   * 默认有效期为 1 小时 (3600s)
   */
  expires_in: number
}

export type IdentityProvider = 'github' | 'google' | 'wechat'

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
    return this.request<User>('/userinfo', undefined, { signal })
  }

  fetchAccessToken(signal: AbortSignal | null) {
    return this.request<AccessToken>('/access_token', undefined, { signal })
  }

  private authentication = createAction<{ status: number }>('__AUTH_CALLBACK__')

  authorize(provider: IdentityProvider) {
    return new Observable<void>((observer) => {
      const { AUTH_URL, PUBLIC_PATH } = this.config
      const url = joinURL(AUTH_URL, `/idp/${provider}/authorize`, {
        next_url: joinURL(PUBLIC_PATH, '/login/state', { provider }),
      })
      const popup = window.open(
        url,
        'popup',
        'popup=true,width=600,height=600,menubar=false,toolbar=false,location=false'
      )
      if (!popup) {
        window.location.assign(url) // redirect if popup is blocked
        return
      }
      const channel = new Channel(popup)
      const subscription = from(channel).subscribe((action) => {
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
        subscription.unsubscribe()
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
    // TODO: implement logout
  }
}

interface State {
  isInitialized: boolean
  user?: User
  accessToken?: string | undefined
  refreshInterval?: number | undefined
  authorize: (provider: IdentityProvider) => void
  authorizingProvider?: IdentityProvider | undefined
  callback: (payload: { status: number }) => void
  logout: () => void
}

const Context = createContext<Readonly<State>>({
  isInitialized: false,
  authorize: () => {},
  callback: () => {},
  logout: () => {},
})

export function useAuth() {
  return useContext(Context)
}

export function AuthProvider(
  props: React.PropsWithChildren<{ fallback?: React.ReactNode }>
) {
  const logger = useLogger()
  const config = useFetcherConfig()
  const authAPI = useMemo(
    () => config && new AuthAPI(logger, config),
    [config, logger]
  )
  const [state, setState] = useState(useAuth())
  const { isInitialized, refreshInterval } = state

  const refresh = useCallback(
    async (authAPI: AuthAPI, signal: AbortSignal | null) => {
      const [user, { access_token, expires_in }] = await Promise.all([
        authAPI.fetchUser(signal),
        authAPI.fetchAccessToken(signal),
      ])
      setState((state) => ({
        ...state,
        user,
        accessToken: access_token,
        refreshInterval: expires_in,
      }))
    },
    []
  )

  useEffect(() => {
    if (!authAPI) return
    const controller = new AbortController()
    let aborted = false
    refresh(authAPI, controller.signal)
      .catch((error) => {
        // TODO: handle error
      })
      .finally(() => {
        if (aborted) return
        setState((state) => ({ ...state, isInitialized: true }))
      })
    return () => {
      controller.abort()
      aborted = true
    }
  }, [authAPI, refresh])

  useEffect(() => {
    if (!authAPI || !refreshInterval) return
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
    if (!authAPI) return
    const subscriptionList = new Set<Subscription>()
    const authorize = (provider: IdentityProvider) => {
      setState((state) => ({ ...state, authorizingProvider: provider }))
      const subscription = authAPI
        .authorize(provider)
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
            setState((state) => ({ ...state, authorizingProvider: undefined }))
            subscriptionList.delete(subscription)
          })
        )
        .subscribe()
      subscriptionList.add(subscription)
    }
    const callback = authAPI.callback.bind(authAPI)
    const logout = authAPI.logout.bind(authAPI)
    setState((state) => ({ ...state, authorize, callback, logout }))
    return () => {
      subscriptionList.forEach((subscription) => subscription.unsubscribe())
      subscriptionList.clear()
    }
  }, [authAPI, refresh])

  return createElement(
    Context.Provider,
    { value: state },
    isInitialized ? props.children : props.fallback
  )
}
