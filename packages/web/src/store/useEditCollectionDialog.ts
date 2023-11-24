import { type ToastAPI } from '@yiwen-ai/component'
import {
  initialCollectionDraft,
  toMessage,
  useCollection,
  useCollectionAPI,
  useUploadAPI,
  type CollectionDraft,
  type UpdateCollectionInput,
} from '@yiwen-ai/store'
import { isBlobURL } from '@yiwen-ai/util'
import { isEqual } from 'lodash-es'
import { useCallback, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import { lastValueFrom } from 'rxjs'
import { Xid } from 'xid-ts'

interface Params {
  open: boolean
  _gid: string | undefined
  _cid: string | undefined
}

export function useEditCollectionDialog(pushToast: ToastAPI['pushToast']) {
  const intl = useIntl()
  const { uploadFromBlobURL } = useUploadAPI()
  const { readCollectionFull, readCollectionUploadPolicy, updateCollection } =
    useCollectionAPI()

  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [draft, setDraft] = useState<CollectionDraft>(initialCollectionDraft)

  const [{ open, ...params }, setParams] = useState<Params>({
    open: false,
    _gid: undefined,
    _cid: undefined,
  })

  const { refresh } = useCollection(params._gid, params._cid, undefined)

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
    setDraft(initialCollectionDraft())
    setParams({
      open: false,
      _gid: undefined,
      _cid: undefined,
    })
  }, [])

  const output = useMemo(async () => {
    if (params._gid && params._cid && open) {
      setIsLoading(true)
      const { result } = await readCollectionFull({
        gid: params._gid,
        id: params._cid,
        fields: undefined,
        language: undefined,
      })

      setDraft({
        language: result.language,
        context: result.context,
        info: { ...result.info },
        cover: result.cover,
        price: result.price,
        creation_price: result.creation_price,
      })
      setIsLoading(false)
      return result
    }
    return undefined
  }, [open, params._gid, params._cid, readCollectionFull])

  const onSave = useCallback(async () => {
    if (!output) {
      return
    }
    const collection = await output
    if (!collection) {
      return
    }

    try {
      setIsSaving(true)
      const input: UpdateCollectionInput = {
        gid: collection.gid,
        id: collection.id,
        updated_at: collection.updated_at,
        version: collection.version,
        language: collection.language,
      }
      if (draft.context !== collection.context) {
        input.context = draft.context
      }
      if (draft.price !== collection.price) {
        input.price = draft.price
      }
      if (draft.creation_price !== collection.creation_price) {
        input.creation_price = draft.creation_price
      }

      if (!isEqual(input.info, draft.info)) {
        input.info = { ...draft.info }
      }

      if (isBlobURL(draft.cover)) {
        const { result: uploadPolicy } = await readCollectionUploadPolicy({
          gid: Xid.fromValue(collection.gid).toString(),
          id: Xid.fromValue(collection.id).toString(),
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

        input.cover = uploadOutput.value
      }

      await updateCollection(input)
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
    updateCollection,
    readCollectionUploadPolicy,
    uploadFromBlobURL,
  ])
  //#endregion

  return {
    open,
    draft,
    setDraft,
    show,
    close,
    editMode: true,
    isLoading,
    isSaving,
    error: null,
    onSave,
  } as const
}
