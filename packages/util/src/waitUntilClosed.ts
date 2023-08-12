import { Observable, timer } from 'rxjs'

export function waitUntilClosed(target: Window, interval = 1000) {
  return new Observable<void>((observer) =>
    timer(0, interval).subscribe(() => {
      if (target.closed) {
        observer.next()
        observer.complete()
      }
    })
  )
}
