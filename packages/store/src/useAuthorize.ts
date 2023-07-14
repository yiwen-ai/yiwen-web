import {
  ChannelMessageHelper,
  joinURL,
  useConnect,
  useSubscriptionManager,
} from '@yiwen-ai/util'
import { useCallback, useState } from 'react'
import { useFetcherConfig } from './useFetcher'
import { useUser } from './useUser'

export type IdentityProvider = 'github'

export const AuthorizationResult = ChannelMessageHelper.create<{
  status: number
}>('AUTHORIZATION_RESULT')

export function useAuthorize() {
  const { PUBLIC_PATH, AUTH_URL } = useFetcherConfig()
  const [user, refresh] = useUser()
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
        if (!popup) return
        // TODO: check if popup is closed before receiving message
        const channel = await connect(popup)
        const unsubscribe = subscriptionManager.addUnsubscribe(
          channel.subscribe((message) => {
            if (!AuthorizationResult.is(message)) return
            switch (message.payload.status) {
              case 200:
                popup.close()
                refresh()
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
      refresh,
      subscriptionManager,
    ]
  )

  return [user, authorize, isAuthorizing, provider] as const
}
