import { useCallback, useEffect, useLayoutEffect, useMemo } from 'react'
import { isWindow } from './isWindow'
import {
  useSubscriptionManager,
  type Unsubscribe,
} from './useSubscriptionManager'

export interface ChannelMessage<T = unknown> {
  type: string
  payload: T
}

type ChannelSource = Window | ServiceWorker | Worker | null

interface Channel {
  send: (message: ChannelMessage) => void
  subscribe: <T = unknown>(
    callback: (message: ChannelMessage<T>) => void
  ) => Unsubscribe
}

const CONNECT_MESSAGE = { type: '$$CONNECT' } as ChannelMessage

export function useChannel(target: ChannelSource) {
  const channel = useMemo(() => new MessageChannel(), [])

  useLayoutEffect(() => {
    if (!target) return
    if (isWindow(target)) {
      target.postMessage(CONNECT_MESSAGE, location.origin, [channel.port2])
    } else {
      target.postMessage(CONNECT_MESSAGE, [channel.port2])
    }
  }, [channel.port2, target])

  useEffect(() => {
    if (!target) return
    return () => {
      channel.port1.close() // TODO: also remove all listeners
    }
  }, [channel.port1, target])

  return useMemo<Channel>(() => {
    if (!target) return createChannel(undefined)
    return createChannel(channel.port1)
  }, [channel.port1, target])
}

function createChannel(port: MessagePort | undefined): Channel {
  if (!port) {
    return {
      send: () => undefined,
      subscribe: () => () => undefined,
    }
  }

  return {
    send: (message) => {
      // TODO: wait for port to be ready
      port.postMessage(message)
    },
    subscribe: (callback) => {
      const listener = (ev: MessageEvent) => callback(ev.data)
      port.addEventListener('message', listener)
      port.start()
      return () => port.removeEventListener('message', listener)
    },
  }
}

export function useConnect() {
  const subscriptionManager = useSubscriptionManager()

  return useCallback(
    (source: ChannelSource) => {
      return new Promise<Channel>((resolve) => {
        if (!source) return resolve(createChannel(undefined))
        const listener = (ev: MessageEvent<ChannelMessage | undefined>) => {
          if (ev.source === source && ev.data?.type === CONNECT_MESSAGE.type) {
            const port2 = ev.ports[0]
            resolve(createChannel(port2))
            subscriptionManager.addUnsubscribe(() => port2.close()) // TODO: also remove all listeners
            unsubscribe()
          }
        }
        window.addEventListener('message', listener)
        const unsubscribe = subscriptionManager.addUnsubscribe(() =>
          window.removeEventListener('message', listener)
        )
      })
    },
    [subscriptionManager]
  )
}
