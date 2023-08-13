import {
  Dialog,
  DialogBody,
  DialogClose,
  type DialogProps,
} from '@yiwen-ai/component'
import { CreationViewer, type CreationViewerProps } from './CreationViewer'

interface CreationDialogProps extends CreationViewerProps, DialogProps {}

export function CreationDialog({ gid, cid, ...props }: CreationDialogProps) {
  return (
    <Dialog {...props}>
      <DialogBody>
        <CreationViewer gid={gid} cid={cid} />
      </DialogBody>
      <DialogClose />
    </Dialog>
  )
}
