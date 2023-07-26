import { css, useTheme } from '@emotion/react'
import { RGBA, useControlled, useLayoutEffect } from '@yiwen-ai/util'
import {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useRef,
  type HTMLAttributes,
} from 'react'
import { useClickAway } from 'react-use'
import { Button } from './Button'
import { Icon } from './Icon'
import { Portal, type PortalProps } from './Portal'

interface TriggerProps {
  onClick: (ev: React.SyntheticEvent) => void
  onKeyDown: (ev: React.KeyboardEvent) => void
}

export interface DialogProps extends HTMLAttributes<HTMLDivElement> {
  trigger?: (props: TriggerProps) => JSX.Element
  container?: PortalProps['container']
  head?: string | JSX.Element | null | (() => JSX.Element | null)
  foot?: string | JSX.Element | null | (() => JSX.Element | null)
  body?: string | JSX.Element | null | (() => JSX.Element | null)
  defaultOpen?: boolean
  open?: boolean
  onToggle?: (open: boolean) => void
  onShow?: () => void
  onHide?: () => void
}

export interface DialogRef {
  show: () => void
  hide: () => void
}

export const Dialog = memo(
  forwardRef(function Dialog(
    {
      trigger,
      container,
      head,
      foot,
      body,
      defaultOpen = false,
      open: _open,
      onToggle,
      onShow,
      onHide,
      onKeyDown,
      ...props
    }: DialogProps,
    ref: React.Ref<DialogRef>
  ) {
    const theme = useTheme()
    const [open, setOpen] = useControlled({
      defaultValue: defaultOpen,
      value: _open,
      onChange: onToggle,
    })

    const handleToggle = useCallback(
      (ev: React.SyntheticEvent) => {
        if (ev.isPropagationStopped()) return
        setOpen(!open)
        open ? onHide?.() : onShow?.()
      },
      [onHide, onShow, open, setOpen]
    )

    const handleShow = useCallback(() => {
      setOpen(true)
      onShow?.()
    }, [onShow, setOpen])

    const handleHide = useCallback(() => {
      setOpen(false)
      onHide?.()
    }, [onHide, setOpen])

    useImperativeHandle(
      ref,
      (): DialogRef => ({
        show: handleShow,
        hide: handleHide,
      }),
      [handleHide, handleShow]
    )

    const handleEscape = useCallback(
      (ev: React.KeyboardEvent | KeyboardEvent) => {
        if (!open) return
        if ((ev as React.KeyboardEvent).isPropagationStopped?.()) return
        if (ev.key === 'Escape') {
          ev.stopPropagation()
          handleHide()
        }
      },
      [handleHide, open]
    )

    const handleKeyDown = useCallback(
      (ev: React.KeyboardEvent<HTMLDivElement>) => {
        onKeyDown?.(ev)
        handleEscape(ev)
      },
      [handleEscape, onKeyDown]
    )

    useLayoutEffect(() => {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }, [handleEscape])

    const dialogEl = useRef<HTMLDivElement>(null)
    useClickAway(dialogEl, handleHide)

    return (
      <>
        {trigger?.({ onClick: handleToggle, onKeyDown: handleEscape })}
        {open && (
          <Portal container={container}>
            <div
              css={css`
                position: fixed;
                inset: 0;
                background: ${theme.color.dialog.backdrop};
                z-index: 1;
              `}
            />
            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
            <div
              role='dialog'
              aria-modal='true'
              tabIndex={-1}
              onKeyDown={handleKeyDown}
              {...props}
              ref={dialogEl}
              css={css`
                position: fixed;
                inset: 0;
                margin: 96px 80px 0;
                background: ${theme.color.dialog.background};
                border-radius: 20px 20px 0 0;
                border: none;
                display: flex;
                flex-direction: column;
                z-index: 1;
              `}
            >
              {typeof head === 'function' ? (
                head()
              ) : head ? (
                <div
                  data-dialog-head={true}
                  css={css`
                    padding: 24px;
                    text-align: center;
                  `}
                >
                  {head}
                </div>
              ) : null}
              {typeof body === 'function' ? (
                body()
              ) : body ? (
                <div
                  data-dialog-body={true}
                  css={css`
                    flex: 1;
                    padding: 24px;
                    overflow-y: auto;
                  `}
                >
                  {body}
                </div>
              ) : (
                props.children
              )}
              {typeof foot === 'function' ? (
                foot()
              ) : foot ? (
                <div
                  data-dialog-foot={true}
                  css={css`
                    padding: 24px;
                    text-align: center;
                  `}
                >
                  {foot}
                </div>
              ) : null}
              <Button
                data-dialog-close={true}
                shape='circle'
                onClick={handleHide}
                css={css`
                  position: absolute;
                  left: 100%;
                  bottom: 100%;
                  margin-left: 16px;
                  margin-bottom: 16px;
                `}
              >
                <Icon
                  name='closecircle2'
                  css={{ color: RGBA(theme.palette.grayLight, 0.4) }}
                />
              </Button>
            </div>
          </Portal>
        )}
      </>
    )
  })
)
