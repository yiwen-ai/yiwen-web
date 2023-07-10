import { without } from 'lodash-es'
import { useEffect, useMemo } from 'react'

export interface Unsubscribe {
  (): void
}

interface SubscriptionManager {
  addUnsubscribe: (unsubscribe: Unsubscribe) => Unsubscribe
  unsubscribeAll: () => void
}

export function useSubscriptionManager() {
  const manager = useMemo<SubscriptionManager>(() => {
    let list: Unsubscribe[] = []

    return {
      addUnsubscribe: (unsubscribe) => {
        list.push(unsubscribe)
        return () => {
          unsubscribe()
          list = without(list, unsubscribe)
        }
      },
      unsubscribeAll: () => {
        list.forEach((unsubscribe) => unsubscribe())
        list = []
      },
    }
  }, [])

  useEffect(() => {
    return () => {
      manager.unsubscribeAll()
    }
  }, [manager])

  return manager
}
