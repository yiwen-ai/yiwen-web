import { useCallback } from 'react'
import { useSubscriptionManager } from './useSubscriptionManager'

export function useCheckWindowClosed() {
  const subscriptionManager = useSubscriptionManager()

  return useCallback(
    (target: Window) => {
      return new Promise<boolean>((resolve) => {
        if (target.closed) return resolve(true)
        const timer = window.setInterval(() => {
          if (target.closed) {
            resolve(true)
            unsubscribe()
          }
        }, 1000)
        const unsubscribe = subscriptionManager.addUnsubscribe(() => {
          resolve(false)
          window.clearInterval(timer)
        })
      })
    },
    [subscriptionManager]
  )
}
