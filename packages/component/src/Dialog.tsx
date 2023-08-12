import { css, useTheme } from '@emotion/react'
import {
  RGBA,
  useModal,
  type AnchorProps,
  type ModalProps,
  type ModalRef,
} from '@yiwen-ai/util'
import {
  createContext,
  forwardRef,
  memo,
  useCallback,
  useContext,
  useImperativeHandle,
  type HTMLAttributes,
} from 'react'
import { Button, type ButtonProps } from './Button'
import { Icon } from './Icon'
import { Portal, type PortalProps } from './Portal'

export interface DialogProps
  extends HTMLAttributes<HTMLDivElement>,
    ModalProps {
  anchor?: (props: AnchorProps) => JSX.Element
  container?: PortalProps['container']
}

export const Dialog = memo(
  forwardRef(function Dialog(
    { anchor, container, ...props }: DialogProps,
    ref: React.Ref<ModalRef>
  ) {
    const theme = useTheme()
    const { open, modal, anchorProps, floatingProps } = useModal(props)
    useImperativeHandle(ref, () => modal, [modal])

    return (
      <DialogContext.Provider value={modal}>
        {anchor?.(anchorProps)}
        {open && (
          <Portal container={container}>
            <div
              data-dialog-backdrop={true}
              css={css`
                position: fixed;
                inset: 0;
                background: ${theme.color.dialog.backdrop};
                z-index: 1;
              `}
            />
            <div
              role='dialog'
              aria-modal='true'
              tabIndex={-1}
              {...floatingProps}
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
            />
          </Portal>
        )}
      </DialogContext.Provider>
    )
  })
)

const DialogContext = createContext<ModalRef | undefined>(undefined)

export const DialogHead = memo(function DialogHead(
  props: HTMLAttributes<HTMLDivElement>
) {
  return (
    <div
      data-dialog-head={true}
      {...props}
      css={css`
        padding: 24px;
        text-align: center;
      `}
    />
  )
})

export const DialogBody = memo(function DialogBody(
  props: HTMLAttributes<HTMLDivElement>
) {
  return (
    <div
      data-dialog-body={true}
      {...props}
      css={css`
        flex: 1;
        padding: 24px;
        overflow-y: auto;
      `}
    />
  )
})

export const DialogFoot = memo(function DialogFoot(
  props: HTMLAttributes<HTMLDivElement>
) {
  return (
    <div
      data-dialog-foot={true}
      {...props}
      css={css`
        padding: 24px;
        text-align: center;
      `}
    />
  )
})

export const DialogClose = memo(function DialogClose({
  onClick,
  ...props
}: ButtonProps) {
  const theme = useTheme()
  const dialog = useContext(DialogContext)
  const handleClick = useCallback(
    (ev: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(ev)
      !ev.isDefaultPrevented() && dialog?.close()
    },
    [dialog, onClick]
  )

  return (
    <Button
      data-dialog-close={true}
      shape='circle'
      onClick={handleClick}
      {...props}
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
  )
})
