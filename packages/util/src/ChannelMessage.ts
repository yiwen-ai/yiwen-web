export interface ChannelMessage<T = unknown> {
  type: string
  payload: T
}

interface ChannelMessageFactory<T> {
  (payload: T): ChannelMessage<T>
  is: (message: unknown) => message is ChannelMessage<T>
  freeze: (
    this: ChannelMessageFactory<void>
  ) => readonly [
    ChannelMessage<void>,
    (message: unknown) => message is ChannelMessage<void>
  ]
}

export class ChannelMessageHelper {
  static create<T = void>(type: string) {
    const factory: ChannelMessageFactory<T> = (payload) => ({
      type,
      payload,
    })
    factory.is = (message): message is ChannelMessage<T> => {
      return (
        typeof message === 'object' &&
        message !== null &&
        'type' in message &&
        message.type === type
      )
    }
    factory.freeze = function () {
      return ChannelMessageHelper.freeze(this)
    }
    return factory
  }

  static freeze(factory: ChannelMessageFactory<void>) {
    const message = factory()
    return [message, factory.is] as const
  }
}
