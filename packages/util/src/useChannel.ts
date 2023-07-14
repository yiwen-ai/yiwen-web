import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { ChannelMessageHelper, type ChannelMessage } from './ChannelMessage'
import {
  useSubscriptionManager,
  type Unsubscribe,
} from './useSubscriptionManager'

type MessageEndpoint = Window | ServiceWorker | Worker | null

interface Channel {
  send: (message: ChannelMessage) => void
  subscribe: <T = unknown>(
    callback: (message: ChannelMessage<T>) => void
  ) => Unsubscribe
}

const [CONNECT_MESSAGE, isConnectMessage] =
  ChannelMessageHelper.create('$$CONNECT').freeze()

export function useChannel(target: MessageEndpoint) {
  const channel = useMemo(() => new MessageChannel(), [])
  const initialized = useRef(false)

  useLayoutEffect(() => {
    if (!target) return
    if (initialized.current) return
    try {
      target.postMessage(CONNECT_MESSAGE, {
        transfer: [channel.port2],
        targetOrigin: location.origin, // send to same origin only
      })
      initialized.current = true
    } catch {
      // ignore
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
    (source: MessageEndpoint) => {
      return new Promise<Channel>((resolve) => {
        if (!source) return resolve(createChannel(undefined))
        const listener = (ev: MessageEvent<ChannelMessage | undefined>) => {
          if (
            ev.source === source &&
            ev.origin === location.origin && // receive from same origin only
            isConnectMessage(ev.data)
          ) {
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
