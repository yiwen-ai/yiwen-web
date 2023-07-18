import { useCallback, useRef, useState } from 'react'
import { Observable } from 'rxjs'
import symbolObservable from 'symbol-observable'
import useIsomorphicLayoutEffect from 'use-isomorphic-layout-effect'
import { ChannelMessageHelper, type ChannelMessage } from './ChannelMessage'
import { useLogger } from './logger'
import {
  useSubscriptionManager,
  type Unsubscribe,
} from './useSubscriptionManager'

type MessageEndpoint = Window | ServiceWorker | Worker

const [CONNECT_MESSAGE, isConnectMessage] =
  ChannelMessageHelper.create('$$CONNECT').freeze()

export function useChannel(target: MessageEndpoint | null) {
  const logger = useLogger()
  const [channel, setChannel] = useState<Channel | undefined>()
  const initialized = useRef(false)

  useIsomorphicLayoutEffect(() => {
    try {
      if (!target || initialized.current) return
      const channel = new MessageChannel()
      target.postMessage(CONNECT_MESSAGE, {
        transfer: [channel.port2],
        targetOrigin: location.origin, // send to same origin only
      })
      setChannel(new Channel(channel.port1))
      initialized.current = true
    } catch (error) {
      // TODO: handle error
      logger.error('failed to create channel', { error })
    }
  }, [logger, target])

  useIsomorphicLayoutEffect(() => {
    if (!channel) return
    return () => channel.close()
  }, [channel])

  return channel
}

class Channel {
  constructor(private port: MessagePort) {}

  close() {
    this.port.close() // TODO: also remove all listeners
  }

  send(message: ChannelMessage) {
    // TODO: wait for port to be ready
    this.port.postMessage(message)
  }

  subscribe<T = unknown>(
    callback: (message: ChannelMessage<T>) => void
  ): Unsubscribe {
    const listener = (ev: MessageEvent) => callback(ev.data)
    this.port.addEventListener('message', listener)
    this.port.start()
    return () => this.port.removeEventListener('message', listener)
  }

  [symbolObservable]<T = unknown>() {
    return new Observable<ChannelMessage<T>>((observer) =>
      this.subscribe(observer.next.bind(observer))
    )
  }
}

export function useConnect() {
  const subscriptionManager = useSubscriptionManager()

  return useCallback(
    (source: MessageEndpoint) => {
      return new Promise<Channel>((resolve) => {
        const onMessage = (ev: MessageEvent<ChannelMessage | undefined>) => {
          if (
            ev.source === source &&
            ev.origin === location.origin && // receive from same origin only
            isConnectMessage(ev.data)
          ) {
            const channel = new Channel(ev.ports[0])
            resolve(channel)
            subscriptionManager.addUnsubscribe(() => channel.close())
            unsubscribe()
          }
        }
        window.addEventListener('message', onMessage)
        const unsubscribe = subscriptionManager.addUnsubscribe(() =>
          window.removeEventListener('message', onMessage)
        )
      })
    },
    [subscriptionManager]
  )
}
