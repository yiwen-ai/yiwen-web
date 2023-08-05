import { css } from '@emotion/react'
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogClose,
  AlertDialogHead,
  type AlertDialogProps,
} from '@yiwen-ai/component'

interface MediumDialogProps extends AlertDialogProps {
  title: string
}

export default function MediumDialog({
  title,
  children,
  ...props
}: MediumDialogProps) {
  return (
    <AlertDialog
      role='dialog'
      {...props}
      css={css`
        width: 800px;
        height: 100%;
        max-height: 620px;
      `}
    >
      <AlertDialogHead>{title}</AlertDialogHead>
      <AlertDialogBody
        css={css`
          text-align: unset;
        `}
      >
        {children}
      </AlertDialogBody>
      <AlertDialogClose />
    </AlertDialog>
  )
}
