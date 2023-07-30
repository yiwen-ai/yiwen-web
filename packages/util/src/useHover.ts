import { useState } from 'react'
import { useLayoutEffect } from './useIsomorphicLayoutEffect'

export function useHover(
  ref: React.RefObject<HTMLElement> | HTMLElement | null
) {
  const [isHovered, setIsHovered] = useState(false)
  useLayoutEffect(() => {
    const el = ref instanceof HTMLElement ? ref : ref?.current
    if (!el) return
    const onPointerEnter = () => setIsHovered(true)
    const onPointerLeave = () => setIsHovered(false)
    el.addEventListener('pointerenter', onPointerEnter)
    el.addEventListener('pointerleave', onPointerLeave)
    return () => {
      el.removeEventListener('pointerenter', onPointerEnter)
      el.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [ref])
  return isHovered
}
