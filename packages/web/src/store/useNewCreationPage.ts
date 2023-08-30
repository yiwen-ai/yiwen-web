import {
  useAuth,
  useCreationAPI,
  useMyGroupList,
  type CreationDraft,
} from '@yiwen-ai/store'
import { useCallback, useEffect, useState } from 'react'
import { Xid } from 'xid-ts'

export function useNewCreationPage(_gid: string | null | undefined) {
  const { createCreation } = useCreationAPI()

  //#region draft
  const { locale } = useAuth().user ?? {}

  const { refreshDefaultGroup } = useMyGroupList()

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
    let aborted = false
    Promise.resolve(_gid || refreshDefaultGroup().then((group) => group?.id))
      .then((gid) => {
        if (!aborted && gid) {
          setDraft((prev) => ({
            ...prev,
            gid: Xid.fromValue(gid),
            __isReady: true,
          }))
        }
      })
      .catch(() => {})
    return () => {
      aborted = true
    }
  }, [_gid, refreshDefaultGroup])

  const updateDraft = useCallback((draft: Partial<CreationDraft>) => {
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
