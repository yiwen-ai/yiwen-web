import { useCallback, useState } from 'react'

export function useRefCallback<T>(forwardedRef: React.ForwardedRef<T>) {
  const [ref, setRef] = useState<T | null>(null)
  const updateRef = useCallback<React.RefCallback<T>>(
    (instance) => {
      setRef(instance)
      if (typeof forwardedRef === 'function') {
        forwardedRef(instance)
      } else if (forwardedRef) {
        forwardedRef.current = instance
      }
    },
    [forwardedRef]
  )
  return [ref, updateRef] as const
}
