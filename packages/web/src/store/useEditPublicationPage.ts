import { GROUP_DETAIL_PATH } from '#/App'
import { GroupViewType } from '#/store/useGroupDetailPage'
import { type ToastAPI } from '@yiwen-ai/component'
import {
  DEFAULT_MODEL,
  decode,
  toMessage,
  useAuth,
  usePublication,
  usePublicationAPI,
  usePublicationUploadPolicy,
  useUploadAPI,
  type PublicationDraft,
} from '@yiwen-ai/store'
import { useCallback, useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { generatePath, useNavigate } from 'react-router-dom'
import { concatMap, from } from 'rxjs'
import { Xid } from 'xid-ts'

export function useEditPublicationPage(
  pushToast: ToastAPI['pushToast'],
  _gid: string | null | undefined,
  _cid: string | null | undefined,
  _language: string | null | undefined,
  _version: string | null | undefined
) {
  const intl = useIntl()
  const navigate = useNavigate()
  const { updatePublication } = usePublicationAPI()
  const { upload: _upload } = useUploadAPI()

  //#region draft
  const { locale } = useAuth().user ?? {}

  const { refresh } = usePublication(_gid, _cid, _language, _version)
  const { uploadPolicy } = usePublicationUploadPolicy(
    _gid,
    _cid,
    _language,
    _version
  )

  const [draft, setDraft] = useState<PublicationDraft>(() => ({
    __isReady: false,
    gid: _gid ? Xid.fromValue(_gid) : undefined,
    cid: _cid ? Xid.fromValue(_cid) : undefined,
    language: locale,
    version: undefined,
    model: DEFAULT_MODEL,
    updated_at: undefined,
    title: '',
    content: undefined,
  }))

  useEffect(() => {
    let aborted = false
    refresh()
      .then((publication) => {
        if (!aborted && publication) {
          setDraft((prev) => ({
            ...prev,
            ...publication,
            content: decode(publication.content),
            __isReady: true,
          }))
        }
      })
      .catch(() => {})
    return () => {
      aborted = true
    }
  }, [refresh])

  const updateDraft = useCallback((draft: Partial<PublicationDraft>) => {
    setDraft((prev) => ({ ...prev, ...draft }))
  }, [])
  //#endregion

  const isLoading = !draft.__isReady

  const [isSaving, setIsSaving] = useState(false)

  // TODO: validate draft.content
  const isDisabled =
    isLoading ||
    isSaving ||
    !draft.gid ||
    !draft.cid ||
    !draft.language ||
    draft.version === undefined ||
    !draft.title.trim() ||
    !draft.content

  const onSave = useCallback(async () => {
    try {
      setIsSaving(true)
      const result = await updatePublication(draft)
      pushToast({
        type: 'success',
        message: intl.formatMessage({ defaultMessage: '保存成功' }),
      })
      navigate({
        pathname: generatePath(GROUP_DETAIL_PATH, {
          gid: Xid.fromValue(result.gid).toString(),
          type: GroupViewType.Publication,
        }),
        search: new URLSearchParams({
          cid: Xid.fromValue(result.cid).toString(),
          language: result.language,
          version: result.version.toString(),
        }).toString(),
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
  }, [draft, intl, navigate, pushToast, updatePublication])

  const upload = useCallback(
    (file: File) => {
      const uploadPolicy$ = from(Promise.resolve(uploadPolicy))
      return uploadPolicy$.pipe(
        concatMap((uploadPolicy) => {
          if (!uploadPolicy) {
            const message = intl.formatMessage({ defaultMessage: '上传失败' })
            pushToast({ type: 'warning', message })
            throw new Error(message)
          }
          return _upload(uploadPolicy, file)
        })
      )
    },
    [_upload, intl, pushToast, uploadPolicy]
  )

  return {
    draft,
    updateDraft,
    isLoading,
    isDisabled,
    isSaving,
    onSave,
    upload,
  } as const
}
