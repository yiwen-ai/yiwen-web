import { GROUP_DETAIL_PATH } from '#/App'
import { type ToastAPI } from '@yiwen-ai/component'
import {
  decode,
  diffCreationDraft,
  encode,
  initialCreationDraft,
  toMessage,
  useCreation,
  useCreationAPI,
  useCreationUploadPolicy,
  useUploadAPI,
  type CreationDraft,
  type CreationOutput,
} from '@yiwen-ai/store'
import { isEqual } from 'lodash-es'
import { useCallback, useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { generatePath, useNavigate } from 'react-router-dom'
import { concatMap, from } from 'rxjs'
import { Xid } from 'xid-ts'
import { GroupViewType } from './useGroupDetailPage'

export function useEditCreationPage(
  pushToast: ToastAPI['pushToast'],
  _gid: string | null | undefined,
  _cid: string | null | undefined
) {
  const intl = useIntl()
  const navigate = useNavigate()
  const { updateCreation, updateCreationContent } = useCreationAPI()
  const { upload: _upload } = useUploadAPI()

  //#region draft
  const { isLoading, creation, refresh } = useCreation(_gid, _cid)
  const { uploadPolicy, refresh: refreshUploadPolicy } =
    useCreationUploadPolicy(_gid, _cid)

  const [draft, setDraft] = useState<CreationDraft>(initialCreationDraft)

  useEffect(() => {
    if (creation) {
      setDraft((prev) => ({
        ...prev,
        ...creation,
        content: decode(creation.content),
      }))
    }
  }, [creation])

  const updateDraft = useCallback((draft: Partial<CreationDraft>) => {
    setDraft((prev) => ({ ...prev, ...draft }))
  }, [])
  //#endregion

  const [isSaving, setIsSaving] = useState(false)

  // TODO: validate draft.content
  const isDisabled = isLoading || isSaving || !draft.title.trim()

  const onSave = useCallback(async () => {
    if (!creation) return
    try {
      setIsSaving(true)
      const input = diffCreationDraft(creation, draft)
      let result: CreationOutput | null = null
      if (input) {
        result = await updateCreation(input)
      }

      if (draft.content && creation.content) {
        if (!isEqual(draft.content, decode(creation.content))) {
          const result2 = await updateCreationContent({
            gid: creation.gid,
            id: creation.id,
            language: creation.language,
            updated_at: result?.updated_at || creation.updated_at,
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
          gid: Xid.fromValue(creation.gid).toString(),
          type: GroupViewType.Creation,
        }),
        search: new URLSearchParams({
          cid: Xid.fromValue(creation.id).toString(),
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
    creation,
    intl,
    refresh,
    navigate,
    pushToast,
    updateCreation,
    updateCreationContent,
  ])

  const upload = useCallback(
    (file: File) => {
      const uploadPolicy$ = from(
        Promise.resolve(uploadPolicy || refreshUploadPolicy())
      )
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
    [_upload, intl, pushToast, refreshUploadPolicy, uploadPolicy]
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
