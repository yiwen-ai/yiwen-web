import {
  useAuth,
  useCreationAPI,
  useMyGroupList,
  type CreationDraft,
} from '@yiwen-ai/store'
import { useCallback, useEffect, useState } from 'react'
import { Xid } from 'xid-ts'

export function useNewCreation(_gid: string | null | undefined) {
  const { createCreation } = useCreationAPI()

  //#region draft
  const { locale } = useAuth().user ?? {}

  const {
    defaultGroup: { id: defaultGroupId } = {},
    isLoading: _isLoadingGroup,
  } = useMyGroupList()

  const [draft, setDraft] = useState<CreationDraft>(() => ({
    __isReady: false,
    gid: _gid ? Xid.fromValue(_gid) : undefined,
    id: undefined,
    language: locale,
    updated_at: undefined,
    title: '',
    content: undefined,
  }))

  useEffect(() => {
    const gid = _gid ?? defaultGroupId
    if (gid) {
      setDraft((prev) => {
        const prevGid = prev.gid && Xid.fromValue(prev.gid)
        const nextGid = Xid.fromValue(gid)
        if (prevGid?.equals(nextGid) && prev.__isReady) return prev
        return { ...prev, gid: nextGid, __isReady: true }
      })
    }
  }, [_gid, defaultGroupId])

  const updateDraft = useCallback((draft: Partial<CreationDraft>) => {
    setDraft((prev) => ({ ...prev, ...draft }))
  }, [])
  //#endregion

  const isLoading = _isLoadingGroup || !draft.__isReady

  const [isSaving, setIsSaving] = useState(false)

  // TODO: validate draft.content
  const isDisabled =
    isLoading ||
    isSaving ||
    !draft.gid ||
    !draft.language ||
    !draft.title.trim() ||
    !draft.content

  const save = useCallback(async () => {
    try {
      setIsSaving(true)
      return await createCreation(draft)
    } finally {
      setIsSaving(false)
    }
  }, [createCreation, draft])

  return {
    draft,
    updateDraft,
    isLoading,
    isDisabled,
    isSaving,
    save,
  } as const
}
