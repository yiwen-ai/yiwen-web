import { css } from '@emotion/react'
import { type ModalRef } from '@yiwen-ai/util'
import { forwardRef, memo, type HTMLAttributes } from 'react'
import { type ButtonProps } from './Button'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogFoot,
  DialogHead,
  type DialogProps,
} from './Dialog'

export interface AlertDialogProps extends DialogProps {}

export const AlertDialog = memo(
  forwardRef(function AlertDialog(
    props: AlertDialogProps,
    ref: React.Ref<ModalRef>
  ) {
    return (
      <Dialog
        role='alertdialog'
        {...props}
        ref={ref}
        css={css`
          width: 440px;
          height: fit-content;
          margin: auto;
          border-radius: 20px;
        `}
      />
    )
  })
)

export const AlertDialogHead = memo(function AlertDialogHead(
  props: HTMLAttributes<HTMLDivElement>
) {
  return <DialogHead role='heading' aria-level={2} {...props} />
})

export const AlertDialogBody = memo(function AlertDialogBody(
  props: HTMLAttributes<HTMLDivElement>
) {
  return (
    <DialogBody
      {...props}
      css={css`
        text-align: center;
        :not(:first-of-type) {
          padding-top: 0;
        }
        :not(:last-of-type) {
          padding-bottom: 0;
        }
      `}
    />
  )
})

export const AlertDialogFoot = memo(function AlertDialogFoot(
  props: HTMLAttributes<HTMLDivElement>
) {
  return <DialogFoot {...props} />
})

export const AlertDialogClose = memo(function AlertDialogClose(
  props: ButtonProps
) {
  return (
    <DialogClose
      {...props}
      css={css`
        inset: unset;
        top: 16px;
        right: 16px;
        margin: unset;
      `}
    />
  )
})
