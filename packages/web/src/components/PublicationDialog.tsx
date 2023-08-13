import {
  Dialog,
  DialogBody,
  DialogClose,
  type DialogProps,
} from '@yiwen-ai/component'
import {
  PublicationViewer,
  type PublicationViewerProps,
} from './PublicationViewer'

interface PublicationDialogProps extends PublicationViewerProps, DialogProps {}

export function PublicationDialog({
  gid,
  cid,
  language,
  version,
  ...props
}: PublicationDialogProps) {
  return (
    <Dialog {...props}>
      <DialogBody>
        <PublicationViewer
          gid={gid}
          cid={cid}
          language={language}
          version={version}
        />
      </DialogBody>
      <DialogClose />
    </Dialog>
  )
}
