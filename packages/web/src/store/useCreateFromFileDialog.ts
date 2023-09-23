import { type ToastAPI } from '@yiwen-ai/component'
import { toMessage, useMyGroupList, useUploadDocument } from '@yiwen-ai/store'
import { useCallback, useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { Xid } from 'xid-ts'

export function useCreateFromFileDialog(
  pushToast: ToastAPI['pushToast'],
  _gid: Uint8Array | string | null | undefined
) {
  const intl = useIntl()

  const [gid, setGid] = useState(() =>
    _gid ? Xid.fromValue(_gid).toString() : undefined
  )

  const { refreshDefaultGroup } = useMyGroupList()

  useEffect(() => {
    const controller = new AbortController()
    Promise.resolve(_gid || refreshDefaultGroup().then((group) => group?.id))
      .then((gid) => {
        if (!controller.signal.aborted && gid) {
          setGid(Xid.fromValue(gid).toString())
        }
      })
      .catch(() => {})
    return () => controller.abort()
  }, [_gid, refreshDefaultGroup])

  const [open, setOpen] = useState(false)
  const show = useCallback(() => setOpen(true), [])
  const close = useCallback(() => setOpen(false), [])

  const [file, setFile] = useState<File>()
  const disabled = !file

  const { isUploading, upload } = useUploadDocument(gid)
  const onUpload = useCallback(async () => {
    try {
      if (!file) throw new Error('please select a file')
      return await upload(file)
    } catch (error) {
      pushToast({
        type: 'warning',
        message: intl.formatMessage({ defaultMessage: '上传失败' }),
        description: toMessage(error),
      })
      return undefined
    }
  }, [file, intl, pushToast, upload])

  return {
    open,
    show,
    close,
    file,
    onFileChange: setFile,
    disabled,
    isUploading,
    onUpload,
  } as const
}
