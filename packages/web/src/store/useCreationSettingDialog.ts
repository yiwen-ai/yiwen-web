import { type ToastAPI } from '@yiwen-ai/component'
import {
  CreationStatus,
  diffCreationDraft,
  initialCreationDraft,
  isRTL,
  requireDraftStatus,
  toMessage,
  useCreation,
  useCreationAPI,
  useUploadAPI,
  type CreationDraft,
} from '@yiwen-ai/store'
import { isBlobURL } from '@yiwen-ai/util'
import { useCallback, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import { lastValueFrom } from 'rxjs'
import { Xid } from 'xid-ts'

interface Params {
  open: boolean
  _gid: string | undefined
  _cid: string | undefined
}

export function useCreationSettingDialog(pushToast: ToastAPI['pushToast']) {
  const intl = useIntl()
  const { uploadFromBlobURL } = useUploadAPI()
  const { readCreationUploadPolicy, updateCreation, restoreCreation } =
    useCreationAPI()

  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [{ open, ...params }, setParams] = useState<Params>({
    open: false,
    _gid: undefined,
    _cid: undefined,
  })

  const { creation, refresh } = useCreation(params._gid, params._cid)
  const [draft, setDraft] = useState<CreationDraft>(initialCreationDraft)

  const show = useCallback(
    (
      _gid: Uint8Array | string | null | undefined,
      _cid: Uint8Array | string | null | undefined
    ) => {
      setParams((params) => {
        const gid = _gid ? Xid.fromValue(_gid).toString() : undefined
        const cid = _cid ? Xid.fromValue(_cid).toString() : undefined
        if (
          params.open &&
          (params._gid === gid || gid == null) &&
          params._cid === cid
        ) {
          return params
        }

        return {
          open: true,
          _gid: gid,
          _cid: cid,
        }
      })
    },
    []
  )

  const close = useCallback(() => {
    setParams({
      open: false,
      _gid: undefined,
      _cid: undefined,
    })
    setDraft(initialCreationDraft())
  }, [setParams, setDraft])

  const output = useMemo(async () => {
    if (params._gid && params._cid && open) {
      setIsLoading(true)
      if (creation) {
        setDraft((prev) => ({ ...prev, ...creation }))
        setIsLoading(false)
        return creation
      }
    }
    return undefined
  }, [open, params._gid, params._cid, creation, setDraft])

  const onSave = useCallback(async () => {
    if (!output) return
    const creation = await output
    if (!creation) return

    try {
      setIsSaving(true)
      const input = diffCreationDraft(creation, draft)
      if (!input) return
      if (
        creation.status != CreationStatus.Draft &&
        requireDraftStatus(input)
      ) {
        const { result } = await restoreCreation({
          gid: input.gid,
          id: input.id,
          updated_at: input.updated_at,
          status: CreationStatus.Draft,
        })
        input.updated_at = result.updated_at
      }

      if (isBlobURL(draft.cover)) {
        const { result: uploadPolicy } = await readCreationUploadPolicy({
          gid: Xid.fromValue(creation.gid).toString(),
          id: Xid.fromValue(creation.id).toString(),
          fields: undefined,
        })

        const uploadOutput = await lastValueFrom(
          uploadFromBlobURL(
            uploadPolicy,
            draft.cover,
            draft.__cover_name as string
          )
        )

        input.cover = uploadOutput.value
      }

      await updateCreation(input)
      refresh()
      close()
      pushToast({
        type: 'success',
        message: intl.formatMessage({ defaultMessage: '保存成功' }),
      })
    } catch (error) {
      pushToast({
        type: 'warning',
        message: intl.formatMessage({ defaultMessage: '保存失败' }),
        description: toMessage(error),
      })
    } finally {
      setIsSaving(false)
    }
  }, [
    output,
    intl,
    draft,
    refresh,
    close,
    pushToast,
    setIsSaving,
    updateCreation,
    restoreCreation,
    readCreationUploadPolicy,
    uploadFromBlobURL,
  ])
  //#endregion

  return {
    open,
    draft,
    setDraft,
    show,
    close,
    isLoading,
    isSaving,
    dir: isRTL(creation?.language || '') ? 'rtl' : 'ltr',
    error: null,
    onSave,
    onClose: close,
  } as const
}
