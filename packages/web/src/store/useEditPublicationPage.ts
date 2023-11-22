import { GROUP_DETAIL_PATH } from '#/App'
import { GroupViewType } from '#/store/useGroupDetailPage'
import { type ToastAPI } from '@yiwen-ai/component'
import {
  decode,
  diffPublicationDraft,
  encode,
  initialPublicationDraft,
  toMessage,
  usePublication,
  usePublicationAPI,
  usePublicationUploadPolicy,
  useUploadAPI,
  type PublicationDraft,
  type PublicationOutput,
} from '@yiwen-ai/store'
import { isEqual } from 'lodash-es'
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
  const { updatePublication, updatePublicationContent } = usePublicationAPI()
  const { upload: _upload } = useUploadAPI()

  //#region draft
  const { isLoading, publication, refresh } = usePublication(
    _gid,
    _cid,
    _language,
    _version
  )
  const { uploadPolicy } = usePublicationUploadPolicy(
    _gid,
    _cid,
    _language,
    _version
  )

  const [draft, setDraft] = useState<PublicationDraft>(initialPublicationDraft)

  useEffect(() => {
    if (publication) {
      setDraft((prev) => ({
        ...prev,
        ...publication,
        content: decode(publication.content),
      }))
    }
  }, [publication])

  const updateDraft = useCallback((draft: Partial<PublicationDraft>) => {
    setDraft((prev) => ({ ...prev, ...draft }))
  }, [])
  //#endregion

  const [isSaving, setIsSaving] = useState(false)

  // TODO: validate draft.content
  const isDisabled = isLoading || isSaving || !draft.title?.trim()

  const onSave = useCallback(async () => {
    if (!publication) return
    try {
      setIsSaving(true)
      const input = await diffPublicationDraft(publication, draft)
      let result: PublicationOutput | null = null
      if (input) {
        result = await updatePublication(input)
      }

      if (draft.content && publication.content) {
        if (!isEqual(draft.content, decode(publication.content))) {
          const result2 = await updatePublicationContent({
            gid: publication.gid,
            cid: publication.cid,
            language: publication.language,
            version: publication.version,
            updated_at: result?.updated_at || publication.updated_at,
            content: encode(draft.content),
          })
          result = { ...result, ...result2 }
        }
      }

      if (result) {
        refresh()
        pushToast({
          type: 'success',
          message: intl.formatMessage({ defaultMessage: '保存成功' }),
        })
      }

      navigate({
        pathname: generatePath(GROUP_DETAIL_PATH, {
          gid: Xid.fromValue(publication.gid).toString(),
          type: GroupViewType.Publication,
        }),
        search: new URLSearchParams({
          cid: Xid.fromValue(publication.cid).toString(),
          language: publication.language,
          version: publication.version.toString(),
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
  }, [
    draft,
    publication,
    intl,
    navigate,
    pushToast,
    updatePublication,
    updatePublicationContent,
    refresh,
  ])

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
