export class Deferred<T> {
  resolve!: (value: T | PromiseLike<T>) => void
  reject!: (reason?: unknown) => void
  readonly promise = new Promise<T>((resolve, reject) => {
    this.resolve = resolve
    this.reject = reject
  })
}
