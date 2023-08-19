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
    <Dialog {...props}>
      <DialogHead>{title}</DialogHead>
      <DialogBody>{children}</DialogBody>
      <DialogClose />
    </Dialog>
  )
}
