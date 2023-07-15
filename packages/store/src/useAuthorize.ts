import {
  ChannelMessageHelper,
  joinURL,
  useConnect,
  useSubscriptionManager,
} from '@yiwen-ai/util'
import { useCallback, useState } from 'react'
import { useAccessToken } from './useAccessToken'
import { useFetcherConfig } from './useFetcher'
import { useUser } from './useUser'

export type IdentityProvider = 'github' | 'google' | 'wechat'

export const AuthenticationResult = ChannelMessageHelper.create<{
  status: number
}>('AUTHENTICATION_RESULT')

/**
 * https://github.com/yiwen-ai/auth-api/blob/main/doc/api.md#%E5%8F%91%E8%B5%B7%E7%99%BB%E5%BD%95
 */
export function useAuthorize() {
  const { PUBLIC_PATH, AUTH_URL } = useFetcherConfig()
  const [user, refreshUser] = useUser()
  const [, refreshAccessToken] = useAccessToken()
  const [isAuthorizing, setIsAuthorizing] = useState(false)
  const [provider, setProvider] = useState<IdentityProvider | undefined>()
  const connect = useConnect()
  const subscriptionManager = useSubscriptionManager()

  const authorize = useCallback(
    async (provider: IdentityProvider) => {
      if (isAuthorizing) return
      try {
        setIsAuthorizing(true)
        setProvider(provider)
        const url = joinURL(AUTH_URL, `/idp/${provider}/authorize`, {
          next_url: joinURL(PUBLIC_PATH, '/login/state', { provider }),
        })
        const popup = window.open(
          url,
          'popup',
          'popup=true,width=600,height=600,menubar=false,toolbar=false,location=false'
        )
        if (!popup) return // TODO: handle popup blocked
        // TODO: also close popup when user navigates away from current page
        // TODO: check if popup is closed before receiving message
        const channel = await connect(popup)
        const unsubscribe = subscriptionManager.addUnsubscribe(
          channel.subscribe((message) => {
            if (!AuthenticationResult.is(message)) return
            switch (message.payload.status) {
              case 200:
                popup.close()
                refreshUser()
                refreshAccessToken()
                unsubscribe()
                break
              default:
                popup.close()
                // TODO: failed to authorize, handle error
                // show error message
                unsubscribe()
                break
            }
          })
        )
      } catch (error) {
        // TODO: handle error
      } finally {
        setProvider(undefined)
        setIsAuthorizing(false)
      }
    },
    [
      AUTH_URL,
      PUBLIC_PATH,
      connect,
      isAuthorizing,
      refreshAccessToken,
      refreshUser,
      subscriptionManager,
    ]
  )

  return [user, authorize, isAuthorizing, provider] as const
}
