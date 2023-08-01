import { useRef } from 'react'
import { useLayoutEffect } from './useIsomorphicLayoutEffect'

export function useClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T>,
  onClick: () => void
) {
  const onClickRef = useRef(onClick)
  onClickRef.current = onClick

  useLayoutEffect(() => {
    const handlePointerUp = (ev: PointerEvent) => {
      if (!ref.current?.contains(ev.target as Node)) {
        onClickRef.current()
      }
    }
    document.addEventListener('pointerup', handlePointerUp)
    return () => document.removeEventListener('pointerup', handlePointerUp)
  }, [ref])
}
