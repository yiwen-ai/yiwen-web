import { css } from '@emotion/react'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogHead,
  type DialogProps,
} from '@yiwen-ai/component'
import { stopPropagation } from '@yiwen-ai/util'

interface SmallDialogProps extends DialogProps {
  title: string
}

export default function SmallDialog({
  title,
  children,
  ...props
}: SmallDialogProps) {
  return (
    <Dialog
      onPointerUpCapture={stopPropagation}
      {...props}
      css={css`
        width: 600px;
        height: auto;
        max-width: 100%;
        max-height: 100%;
        top: 50%;
        bottom: unset;
        transform: translateY(-50%);
      `}
    >
      <DialogHead>{title}</DialogHead>
      <DialogBody>{children}</DialogBody>
      <DialogClose />
    </Dialog>
  )
}
