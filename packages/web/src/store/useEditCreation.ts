import {
  decode,
  useAuth,
  useCreation,
  useCreationAPI,
  type CreationDraft,
} from '@yiwen-ai/store'
import { useCallback, useEffect, useState } from 'react'
import { Xid } from 'xid-ts'

export function useEditCreation(
  _gid: string | null | undefined,
  _cid: string | null | undefined
) {
  const { updateCreation } = useCreationAPI()

  //#region draft
  const { locale } = useAuth().user ?? {}

  const { isLoading: _isLoadingCreation, refresh } = useCreation(_gid, _cid)

  const [draft, setDraft] = useState<CreationDraft>(() => ({
    __isReady: false,
    gid: _gid ? Xid.fromValue(_gid) : undefined,
    id: _cid ? Xid.fromValue(_cid) : undefined,
    language: locale,
    updated_at: undefined,
    title: '',
    content: undefined,
  }))

  useEffect(() => {
    let aborted = false
    refresh()
      .then((creation) => {
        if (!aborted && creation) {
          setDraft((prev) => ({
            ...prev,
            ...creation,
            content: decode(creation.content),
            __isReady: true,
          }))
        }
      })
      .catch(() => {})
    return () => {
      aborted = true
    }
  }, [refresh])

  const updateDraft = useCallback((draft: Partial<CreationDraft>) => {
    setDraft((prev) => ({ ...prev, ...draft }))
  }, [])
  //#endregion

  const isLoading = _isLoadingCreation || !draft.__isReady

  const [isSaving, setIsSaving] = useState(false)

  // TODO: validate draft.content
  const isDisabled =
    isLoading ||
    isSaving ||
    !draft.gid ||
    !draft.id ||
    !draft.language ||
    !draft.title.trim() ||
    !draft.content

  const save = useCallback(async () => {
    try {
      setIsSaving(true)
      return await updateCreation(draft)
    } finally {
      setIsSaving(false)
    }
  }, [draft, updateCreation])

  return {
    draft,
    updateDraft,
    isLoading,
    isDisabled,
    isSaving,
    save,
  } as const
}
