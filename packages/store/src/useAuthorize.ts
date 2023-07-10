import {
  joinURL,
  useConnect,
  useSubscriptionManager,
  type ChannelMessage,
} from '@yiwen-ai/util'
import { useCallback, useState } from 'react'
import { useFetcherConfig } from './useFetcher'
import { useUser } from './useUser'

export type IdentityProvider = 'github'

export const AUTHORIZED = { type: '$$AUTHORIZED' } as ChannelMessage

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
            if (message.type === AUTHORIZED.type) {
              popup.close()
              refresh()
              unsubscribe()
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
