import { useMemo, useRef, type DOMAttributes, type SyntheticEvent } from 'react'

export function useClick<
  P extends DOMAttributes<T>,
  T extends Element = P extends DOMAttributes<infer T> ? T : Element
>(props: P, handleClick?: ((ev: SyntheticEvent<T>) => void) | undefined): P {
  const handleClickRef = useRef(handleClick)
  handleClickRef.current = handleClick

  const { onClick, onKeyUp } = useMemo(() => {
    return mergeClickProps(
      { onClick: props.onClick, onKeyUp: props.onKeyUp } as P,
      (ev) => handleClickRef.current?.(ev)
    )
  }, [props.onClick, props.onKeyUp])

  return {
    ...props,
    onClick,
    onKeyUp,
  }
}

export function mergeClickProps<
  P extends DOMAttributes<T>,
  T extends Element = P extends DOMAttributes<infer T> ? T : Element
>(props: P, handleClick?: ((ev: SyntheticEvent<T>) => void) | undefined): P {
  if (!handleClick) return props
  const { onClick, onKeyUp } = props
  return {
    ...props,
    onClick: (ev: React.MouseEvent<T>) => {
      onClick?.(ev)
      if (!ev.isDefaultPrevented()) {
        handleClick(ev)
      }
    },
    onKeyUp: (ev: React.KeyboardEvent<T>) => {
      onKeyUp?.(ev)
      if (!ev.isDefaultPrevented() && (ev.key === 'Enter' || ev.key === ' ')) {
        handleClick(ev)
      }
    },
  }
}
