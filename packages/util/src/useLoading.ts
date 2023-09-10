import { useCallback, useState } from 'react'

export function useLoading<T>(buildKey: (item: T) => string) {
  const [state, setState] = useState({} as Record<string, boolean>)

  const setLoading = useCallback((item: T, isLoading: boolean) => {
    setState((state) => ({
      ...state,
      [buildKey(item)]: isLoading,
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isLoading = useCallback(
    (item: T) => state[buildKey(item)] ?? false,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state]
  )

  return [setLoading, isLoading] as const
}
