import { Observable, distinctUntilChanged, timer } from 'rxjs'

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

export function onLocationChange(target: Window, interval = 1000) {
  return new Observable<string>((observer) =>
    timer(interval, interval).subscribe(() => {
      if (target.closed) {
        observer.complete()
      } else {
        observer.next(target.location.href)
      }
    })
  ).pipe(distinctUntilChanged())
}
