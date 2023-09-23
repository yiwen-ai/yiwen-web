import { useState } from 'react'
import { useLayoutEffect } from './useIsomorphicLayoutEffect'

export function useDragHover(
  ref: React.RefObject<HTMLElement> | HTMLElement | null
) {
  const [isHovered, setIsHovered] = useState(false)
  useLayoutEffect(() => {
    const el = ref instanceof HTMLElement ? ref : ref?.current
    if (!el) return
    const onDragEnter = () => setIsHovered(true)
    const onDragLeave = () => setIsHovered(false)
    el.addEventListener('dragenter', onDragEnter)
    el.addEventListener('dragleave', onDragLeave)
    el.addEventListener('drop', onDragLeave)
    return () => {
      el.removeEventListener('dragenter', onDragEnter)
      el.removeEventListener('dragleave', onDragLeave)
      el.removeEventListener('drop', onDragLeave)
    }
  }, [ref])
  return isHovered
}
