import { useCallback, useRef, type DOMAttributes } from 'react'

export function useClick<
  P extends DOMAttributes<T>,
  T extends Element = P extends DOMAttributes<infer T> ? T : Element
>(props: P, handleClick?: (ev: React.SyntheticEvent<T>) => void): P {
  const { onClick, onKeyUp } = props
  const handleClickRef = useRef(handleClick)
  handleClickRef.current = handleClick

  return {
    ...props,
    onClick: useCallback(
      (ev: React.MouseEvent<T>) => {
        onClick?.(ev)
        if (!ev.isPropagationStopped()) {
          handleClickRef.current?.(ev)
        }
      },
      [onClick]
    ),
    onKeyUp: useCallback(
      (ev: React.KeyboardEvent<T>) => {
        onKeyUp?.(ev)
        if (
          !ev.isPropagationStopped() &&
          (ev.key === 'Enter' || ev.key === ' ')
        ) {
          handleClickRef.current?.(ev)
        }
      },
      [onKeyUp]
    ),
  }
}
