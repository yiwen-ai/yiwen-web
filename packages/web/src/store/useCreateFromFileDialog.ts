import { type ToastAPI } from '@yiwen-ai/component'
import {
  toMessage,
  useEnsureAuthorized,
  useMyGroupList,
  useUploadDocument,
} from '@yiwen-ai/store'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import { Xid } from 'xid-ts'

export function useCreateFromFileDialog(
  pushToast: ToastAPI['pushToast'],
  _gid?: Uint8Array | string | null | undefined
) {
  const intl = useIntl()
  const ensureAuthorized = useEnsureAuthorized()

  const [open, setOpen] = useState(false)
  const show = useMemo(
    () => ensureAuthorized(() => setOpen(true)),
    [ensureAuthorized]
  )
  const close = useCallback(() => setOpen(false), [])

  const [gid, setGid] = useState(() =>
    _gid ? Xid.fromValue(_gid).toString() : undefined
  )

  const { defaultGroup, refreshDefaultGroup } = useMyGroupList()
  const defaultGroupId = defaultGroup?.id

  useEffect(() => {
    if (!open) return
    const controller = new AbortController()
    Promise.resolve(
      _gid || defaultGroupId || refreshDefaultGroup().then((group) => group?.id)
    )
      .then((gid) => {
        if (!controller.signal.aborted && gid) {
          setGid(Xid.fromValue(gid).toString())
        }
      })
      .catch(() => {})
    return () => controller.abort()
  }, [_gid, defaultGroupId, open, refreshDefaultGroup])

  const [file, setFile] = useState<File>()
  const disabled = !file

  const { isUploading, upload } = useUploadDocument(gid)
  const onUpload = useCallback(async () => {
    try {
      if (!file) throw new Error('please select a file')
      let result = await upload(file)
      result = { ...result, title: result.title || file.name }
      return result
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
