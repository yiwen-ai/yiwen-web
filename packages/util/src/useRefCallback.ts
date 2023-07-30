import { useCallback, useState } from 'react'

export function useRefCallback<T>(forwardedRef: React.ForwardedRef<T>) {
  const [ref, setRef] = useState<T | null>(null)
  const updateRef = useCallback<React.RefCallback<T>>(
    (instance) => mergeForwardedRef<T>(forwardedRef, setRef)(instance),
    [forwardedRef]
  )
  return [ref, updateRef] as const
}

export function mergeForwardedRef<T>(
  forwardedRef: React.ForwardedRef<T>,
  setRef: React.RefCallback<T>
): React.RefCallback<T> {
  return (instance) => {
    setRef(instance)
    if (typeof forwardedRef === 'function') {
      forwardedRef(instance)
    } else if (forwardedRef) {
      forwardedRef.current = instance
    }
  }
}
