import { nanoid } from 'nanoid'
import { useEffect, useRef, useState } from 'react'
import { Observable, concatMap, from, fromEvent, map, tap } from 'rxjs'
import { Deferred } from './Deferred'
import { isWindow } from './isWindow'
import { waitUntilClosed } from './waitUntilClosed'

type MessageEndpoint = Window | ServiceWorker | Worker

export function useChannel(target: MessageEndpoint | null) {
  const [channel, setChannel] = useState<Channel | undefined>()
  const initialized = useRef(false)

  useEffect(() => {
    if (!target || initialized.current) return
    initialized.current = true
    const channel = new Channel(target)
    setChannel(channel)
    return () => {
      channel.close()
      initialized.current = false
    }
  }, [target])

  return channel
}

interface Unsubscribe {
  (): void
}

export class Channel {
  private unsubscribeList = new Set<Unsubscribe>()
  private port = new Deferred<MessagePort>()
  private handshake = {
    SYN: createAction<{ id: string }>('$$SYN'),
    ACK: createAction<{ id: string }>('$$ACK'),
  }

  constructor(endpoint: MessageEndpoint) {
    const id = nanoid()
    const channel = new MessageChannel()

    endpoint.postMessage(this.handshake.SYN({ id }), {
      transfer: [channel.port2],
      targetOrigin: location.origin, // send to same origin only
    })

    const closeLocalChannel = () => {
      channel.port1.close()
      channel.port2.close()
      this.unsubscribeList.delete(closeLocalChannel)
    }
    this.unsubscribeList.add(closeLocalChannel)

    const onMessage = (ev: MessageEvent<Action | undefined>) => {
      if (
        ev.source === endpoint &&
        ev.origin === location.origin // receive from same origin only
      ) {
        if (this.handshake.SYN.match(ev.data)) {
          const port2 = ev.ports[0]
          if (port2) {
            endpoint.postMessage(this.handshake.ACK(ev.data.payload))
            this.port.resolve(port2) // use remote port
            removeMessageListener()
            closeLocalChannel() // local channel is no longer needed
            this.unsubscribeList.add(port2.close.bind(port2))
          }
        } else if (this.handshake.ACK.match(ev.data)) {
          if (ev.data.payload.id === id) {
            this.port.resolve(channel.port1) // remote endpoint is ready
            removeMessageListener()
          }
        }
      }
    }

    window.addEventListener('message', onMessage)
    const removeMessageListener = () => {
      window.removeEventListener('message', onMessage)
      this.unsubscribeList.delete(removeMessageListener)
    }
    this.unsubscribeList.add(removeMessageListener)

    // close channel when endpoint is closed
    if (isWindow(endpoint)) {
      const subscription = waitUntilClosed(endpoint).subscribe(
        this.close.bind(this)
      )
      this.unsubscribeList.add(() => subscription.unsubscribe())
    }
  }

  close() {
    this.unsubscribeList.forEach((unsubscribe) => unsubscribe())
    this.unsubscribeList.clear()
  }

  async send(message: Action) {
    const port = await this.port.promise
    port.postMessage(message)
  }

  [Symbol.observable]() {
    return new Observable<Action<unknown>>((observer) => {
      const subscription = from(this.port.promise)
        .pipe(
          tap((port) => port.start()),
          concatMap((port) => fromEvent<MessageEvent>(port, 'message')),
          map((ev) => ev.data)
        )
        .subscribe(observer)
      const onClose = observer.complete.bind(observer)
      this.unsubscribeList.add(onClose)
      return () => {
        subscription.unsubscribe()
        this.unsubscribeList.delete(onClose)
      }
    })
  }
}

interface Action<T = unknown> {
  type: string
  payload: T
}

export function createAction<T = void>(type: string) {
  const creator = (payload: T): Action<T> => ({
    type,
    payload,
  })

  creator.toString = () => `${type}`

  creator.type = type

  creator.match = (action: unknown): action is Action<T> => {
    return (
      typeof action === 'object' &&
      action !== null &&
      'type' in action &&
      action.type === type
    )
  }

  return creator
}
