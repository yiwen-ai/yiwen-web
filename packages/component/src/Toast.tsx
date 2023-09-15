import { css } from '@emotion/react'
import { stopPropagation, useHover, useRefCallback } from '@yiwen-ai/util'
import { without } from 'lodash-es'
import { nanoid } from 'nanoid'
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
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
          max-width: 100%;
          box-sizing: border-box;
        `}
      />
    )
  })
)

export interface ToastContainerProps extends HTMLAttributes<HTMLDivElement> {}

export const ToastContainer = memo(function ToastContainer(
  props: ToastContainerProps
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
          max-width: calc(100% - 16px * 2);
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

export interface ToastAPI {
  pushToast(toast: Readonly<ToastProps>): () => void
  renderToastContainer(props?: ToastContainerProps): JSX.Element | null
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  interface KeyedToastProps extends ToastProps {
    key: string
  }

  const [list, setList] = useState<readonly Readonly<KeyedToastProps>[]>([])

  const pushToast = useCallback<ToastAPI['pushToast']>((toast) => {
    const item: Readonly<KeyedToastProps> = {
      ...toast,
      key: nanoid(6),
      onClose: () => {
        toast.onClose?.()
        closeToast()
      },
    }
    setList((list) => list.concat(item))
    const closeToast = () => setList((list) => without(list, item))
    return closeToast
  }, [])

  const renderToastContainer = useCallback<ToastAPI['renderToastContainer']>(
    (props) => {
      return list.length > 0 ? (
        <ToastContainer onPointerUpCapture={stopPropagation} {...props}>
          {list.map(({ key, ...item }) => (
            <Toast key={key} data-toast-id={key} {...item} />
          ))}
        </ToastContainer>
      ) : null
    },
    [list]
  )

  return useMemo<ToastAPI>(
    () => ({ pushToast, renderToastContainer }),
    [pushToast, renderToastContainer]
  )
}
