import { GROUP_DETAIL_PATH } from '#/App'
import { type ToastAPI } from '@yiwen-ai/component'
import {
  toMessage,
  useAuth,
  useCollectionAPI,
  useCollectionList,
  useUploadAPI,
  type CollectionDraft,
  type CreateCollectionInput,
  type UpdateCollectionInput,
} from '@yiwen-ai/store'
import { isBlobURL } from '@yiwen-ai/util'
import { useCallback, useState } from 'react'
import { useIntl } from 'react-intl'
import { generatePath, useNavigate } from 'react-router-dom'
import { lastValueFrom } from 'rxjs'
import { Xid } from 'xid-ts'
import { GroupViewType } from './useGroupDetailPage'

export function useCreateCollectionDialog(
  pushToast: ToastAPI['pushToast'],
  _gid: string | null | undefined
) {
  const intl = useIntl()
  const navigate = useNavigate()
  const { uploadFromBlobURL } = useUploadAPI()
  const { createCollection, readCollectionUploadPolicy, updateCollection } =
    useCollectionAPI()

  //#region Dialog
  const [open, setOpen] = useState(false)
  const show = useCallback(() => setOpen(true), [])
  const close = useCallback(() => setOpen(false), [])
  //#endregion
  const [isSaving, setIsSaving] = useState(false)

  const { locale } = useAuth().user ?? {}

  const [draft, setDraft] = useState<CollectionDraft>(() => ({
    language: locale || '',
    context: '',
    info: {
      title: '',
      summary: '',
      keywords: [],
      authors: [],
    },
    cover: '',
    price: 0,
    creation_price: 0,
  }))

  const { refresh: refreshCollectionList } = useCollectionList(
    open ? _gid : null,
    undefined
  )

  const navigateTo = useCallback(
    (gid: Uint8Array, cid: Uint8Array) => {
      navigate({
        pathname: generatePath(GROUP_DETAIL_PATH, {
          gid: Xid.fromValue(gid).toString(),
          type: GroupViewType.Collection,
        }),
        search: new URLSearchParams({
          cid: Xid.fromValue(cid).toString(),
        }).toString(),
      })
    },
    [navigate]
  )

  const onSave = useCallback(async () => {
    try {
      setIsSaving(true)
      const input = {
        gid: Xid.fromValue(_gid as string).toBytes(),
        ...draft,
      } as CreateCollectionInput
      delete input.cover
      delete input.__cover_name

      const result = await createCollection(input)
      if (isBlobURL(draft.cover)) {
        const { result: uploadPolicy } = await readCollectionUploadPolicy({
          gid: Xid.fromValue(result.gid).toString(),
          id: Xid.fromValue(result.id).toString(),
          fields: undefined,
          language: undefined,
        })

        const uploadOutput = await lastValueFrom(
          uploadFromBlobURL(
            uploadPolicy,
            draft.cover,
            draft.__cover_name as string
          )
        )
        const res = await updateCollection({
          gid: result.gid,
          id: result.id,
          updated_at: result.updated_at,
          cover: uploadOutput.value,
        } as UpdateCollectionInput)

        result.cover = uploadOutput.value as string
        result.updated_at = res.updated_at as number
      }

      refreshCollectionList()
      close()
      pushToast({
        type: 'success',
        message: intl.formatMessage({ defaultMessage: '保存成功' }),
      })
      navigateTo(result.gid, result.id)
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
    _gid,
    intl,
    draft,
    close,
    pushToast,
    navigateTo,
    setIsSaving,
    createCollection,
    updateCollection,
    readCollectionUploadPolicy,
    refreshCollectionList,
    uploadFromBlobURL,
  ])
  //#endregion

  return {
    open,
    draft,
    setDraft,
    show,
    close,
    editMode: false,
    isLoading: false,
    isSaving,
    error: null,
    onSave,
  } as const
}
