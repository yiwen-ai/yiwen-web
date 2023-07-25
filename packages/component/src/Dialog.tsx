import { css, useTheme } from '@emotion/react'
import { RGBA, useControlled } from '@yiwen-ai/util'
import {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  type HTMLAttributes,
} from 'react'
import { Button } from './Button'
import { Icon } from './Icon'
import { Portal, type PortalProps } from './Portal'

interface TriggerProps {
  onClick: (ev?: React.SyntheticEvent) => void
}

export interface DialogProps extends HTMLAttributes<HTMLDivElement> {
  trigger?: (props: TriggerProps) => JSX.Element
  container?: PortalProps['container']
  head?: string | JSX.Element | (() => JSX.Element)
  body?: string | JSX.Element | (() => JSX.Element)
  foot?: string | JSX.Element | (() => JSX.Element)
  defaultOpen?: boolean
  open?: boolean
  onToggle?: (open: boolean) => void
  onShow?: () => void
  onClose?: () => void
}

interface DialogRef {
  show: () => void
  close: () => void
}

export const Dialog = memo(
  forwardRef(function Dialog(
    {
      trigger,
      container,
      head,
      body,
      foot,
      defaultOpen = false,
      open: _open,
      onToggle,
      onShow,
      onClose,
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

    const handleShow = useCallback(
      (ev?: React.SyntheticEvent) => {
        if (ev?.isPropagationStopped()) return
        setOpen(true)
        onShow?.()
      },
      [onShow, setOpen]
    )

    const handleClose = useCallback(() => {
      setOpen(false)
      onClose?.()
    }, [onClose, setOpen])

    useImperativeHandle(
      ref,
      (): DialogRef => ({
        show: handleShow,
        close: handleClose,
      }),
      [handleClose, handleShow]
    )

    return (
      <>
        {trigger?.({ onClick: handleShow })}
        {open && (
          <Portal container={container}>
            <div
              css={css`
                position: fixed;
                inset: 0;
                background: ${theme.color.dialog.backdrop};
              `}
            />
            <div
              role='dialog'
              aria-modal='true'
              tabIndex={-1}
              {...props}
              css={css`
                position: fixed;
                inset: 0;
                width: 440px;
                height: fit-content;
                margin: auto;
                background: ${theme.color.dialog.background};
                border-radius: 20px;
                border: none;
                display: flex;
                flex-direction: column;
                z-index: 1;
              `}
            >
              {typeof head === 'function' ? (
                head()
              ) : head ? (
                <h2
                  css={css`
                    padding: 24px;
                    text-align: center;
                  `}
                >
                  {head}
                </h2>
              ) : null}
              {typeof body === 'function' ? (
                body()
              ) : body ? (
                <div
                  css={css`
                    flex: 1;
                    padding: 0 24px;
                    :first-of-type {
                      padding-top: 24px;
                    }
                    :last-of-type {
                      padding-bottom: 24px;
                    }
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
                  css={css`
                    padding: 24px;
                    text-align: center;
                  `}
                >
                  {foot}
                </div>
              ) : null}
              <Button
                shape='circle'
                onClick={handleClose}
                css={css`
                  position: absolute;
                  top: 16px;
                  right: 16px;
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
