import { debounce } from 'lodash-es'
import { useEffect } from 'react'

export function useKeyDown(
  enabled: boolean,
  onKeyDown: (key: string) => void,
  debounceTime = 618
) {
  useEffect(() => {
    if (!enabled) return undefined

    const call =
      debounceTime > 0
        ? debounce(onKeyDown, debounceTime, {
            leading: true,
            trailing: false,
          })
        : onKeyDown

    const handler = (ev: React.KeyboardEvent | KeyboardEvent) => {
      if (!(ev as React.KeyboardEvent).isDefaultPrevented?.()) {
        ev.stopPropagation()
        // console.log('keydown', ev.key)
        call(ev.key)
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [enabled, onKeyDown, debounceTime])
}
