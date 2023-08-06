import { css } from '@emotion/react'
import { useHover, useRefCallback } from '@yiwen-ai/util'
import { without } from 'lodash-es'
import { nanoid } from 'nanoid'
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
} from 'react'
import { Alert, type AlertProps } from './Alert'
import { Portal } from './Portal'

export type { AlertType as ToastType } from './Alert'

export interface ToastProps extends AlertProps {
  duration?: number
  onClose?: () => void
}

const DEFAULT_DURATION = 3000

export const Toast = memo(
  forwardRef(function Toast(
    { duration = DEFAULT_DURATION, onClose, ...props }: ToastProps,
    forwardedRef: React.ForwardedRef<HTMLDivElement>
  ) {
    const [el, setRef] = useRefCallback(forwardedRef)
    const hover = useHover(el)

    useEffect(() => {
      if (hover) return // reset timer when hover
      if (!Number.isFinite(duration)) return // keep open when duration is infinite
      if (!onClose) return
      const timer = window.setTimeout(onClose, duration)
      return () => window.clearTimeout(timer)
    }, [duration, hover, onClose])

    return (
      <Alert
        role='log'
        onClose={onClose}
        {...props}
        ref={setRef}
        css={css`
          width: 444px;
          box-sizing: border-box;
        `}
      />
    )
  })
)

export const ToastContainer = memo(function ToastContainer(
  props: HTMLAttributes<HTMLDivElement>
) {
  return (
    <Portal>
      <div
        data-toast-container={true}
        {...props}
        css={css`
          position: fixed;
          top: 36px;
          left: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          transform: translateX(-50%);
          z-index: 1;
        `}
      />
    </Portal>
  )
})

interface Close {
  (): void
}

export interface ToastAPI {
  push(toast: Readonly<ToastProps>): Close
  render(): JSX.Element | null
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const [list, setList] = useState<readonly Readonly<ToastProps>[]>([])
  const map = useRef(new Map<Readonly<ToastProps>, string>())

  const close = useCallback((toast: Readonly<ToastProps>) => {
    setList((list) => without(list, toast))
    map.current.delete(toast)
  }, [])

  const push = useCallback(
    (toast: Readonly<ToastProps>): Close => {
      const toast2: ToastProps = { ...toast }
      toast2.onClose = () => {
        toast.onClose?.()
        close(toast2)
      }
      setList((list) => list.concat(toast2))
      map.current.set(toast2, nanoid(6))
      return () => close(toast2)
    },
    [close]
  )

  const render = useCallback(() => {
    if (list.length === 0) return null
    return (
      <ToastContainer>
        {list.map((item, index) => (
          <Toast
            key={map.current.get(item) ?? index}
            data-toast-id={map.current.get(item)}
            {...item}
          />
        ))}
      </ToastContainer>
    )
  }, [list])

  return useMemo<ToastAPI>(() => ({ push, render }), [push, render])
}
