import { BREAKPOINT } from '#/shared'
import { css } from '@emotion/react'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogHead,
  type DialogProps,
} from '@yiwen-ai/component'

interface MediumDialogProps extends DialogProps {
  title: string
}

export default function MediumDialog({
  title,
  children,
  ...props
}: MediumDialogProps) {
  return (
    <Dialog
      {...props}
      css={css`
        @media (max-width: ${BREAKPOINT.small}px) {
          width: unset;
          height: unset;
          max-width: unset;
          max-height: unset;
          border-radius: unset;
        }
      `}
    >
      <DialogHead>{title}</DialogHead>
      <DialogBody>{children}</DialogBody>
      <DialogClose />
    </Dialog>
  )
}
