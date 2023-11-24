import { type ToastAPI } from '@yiwen-ai/component'
import {
  PublicationStatus,
  diffPublicationDraft,
  initialPublicationDraft,
  isRTL,
  toMessage,
  usePublication,
  usePublicationAPI,
  useUploadAPI,
  type PublicationDraft,
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
  _language: string | undefined
  _version: number | undefined
}

export function usePublicationSettingDialog(pushToast: ToastAPI['pushToast']) {
  const intl = useIntl()
  const { uploadFromBlobURL } = useUploadAPI()
  const { readPublicationUploadPolicy, updatePublication, restorePublication } =
    usePublicationAPI()

  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [{ open, ...params }, setParams] = useState<Params>({
    open: false,
    _gid: undefined,
    _cid: undefined,
    _language: undefined,
    _version: undefined,
  })

  const { publication, refresh } = usePublication(
    params._gid,
    params._cid,
    params._language,
    params._version
  )
  const [draft, setDraft] = useState<PublicationDraft>(initialPublicationDraft)

  const show = useCallback(
    (
      _gid: Uint8Array | string | null | undefined,
      _cid: Uint8Array | string | null | undefined,
      _language: string | null | undefined,
      _version: number | string | null | undefined
    ) => {
      setParams((params) => {
        const gid = _gid ? Xid.fromValue(_gid).toString() : undefined
        const cid = _cid ? Xid.fromValue(_cid).toString() : undefined
        const language = _language ? _language : undefined
        const version = _version != null ? Number(_version) : undefined

        if (
          params.open &&
          (params._gid === gid || gid == null) &&
          params._cid === cid &&
          (params._language === language || language == null) &&
          (params._version === version || version == null)
        ) {
          return params
        }

        return {
          open: true,
          _gid: gid,
          _cid: cid,
          _language: language,
          _version: version,
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
      _language: undefined,
      _version: undefined,
    })
    setDraft(initialPublicationDraft())
  }, [setParams, setDraft])

  const output = useMemo(async () => {
    if (params._gid && params._cid && open) {
      setIsLoading(true)
      if (publication) {
        setDraft((prev) => ({ ...prev, ...publication }))
        setIsLoading(false)
        return publication
      }
    }
    return undefined
  }, [open, params._gid, params._cid, publication, setDraft])

  const onSave = useCallback(async () => {
    if (!output) return
    const publication = await output
    if (!publication) return

    try {
      setIsSaving(true)
      const input = diffPublicationDraft(publication, draft)
      if (!input) return
      if (publication.status != PublicationStatus.Review) {
        const { result } = await restorePublication({
          gid: input.gid,
          cid: input.cid,
          language: input.language,
          version: input.version,
          updated_at: input.updated_at,
          status: PublicationStatus.Review,
        })
        input.updated_at = result.updated_at
      }

      if (isBlobURL(draft.cover)) {
        const { result: uploadPolicy } = await readPublicationUploadPolicy({
          gid: Xid.fromValue(publication.gid).toString(),
          cid: Xid.fromValue(publication.cid).toString(),
          language: publication.language,
          version: String(publication.version),
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

      await updatePublication(input)
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
    updatePublication,
    restorePublication,
    readPublicationUploadPolicy,
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
    dir: isRTL(publication?.language || '') ? 'rtl' : 'ltr',
    error: null,
    onSave,
    onClose: close,
  } as const
}
