import {
  DEFAULT_MODEL,
  decode,
  useAuth,
  usePublication,
  usePublicationAPI,
  type PublicationDraft,
} from '@yiwen-ai/store'
import { useCallback, useEffect, useState } from 'react'
import { Xid } from 'xid-ts'

export function useEditPublicationPage(
  _gid: string | null | undefined,
  _cid: string | null | undefined,
  _language: string | null | undefined,
  _version: string | null | undefined
) {
  const { updatePublication } = usePublicationAPI()

  //#region draft
  const { locale } = useAuth().user ?? {}

  const { refresh } = usePublication(_gid, _cid, _language, _version)

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

  const save = useCallback(async () => {
    try {
      setIsSaving(true)
      return await updatePublication(draft)
    } finally {
      setIsSaving(false)
    }
  }, [draft, updatePublication])

  return {
    draft,
    updateDraft,
    isLoading,
    isDisabled,
    isSaving,
    save,
  } as const
}
