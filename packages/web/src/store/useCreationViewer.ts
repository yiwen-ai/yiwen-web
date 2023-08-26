import { useCreation, useLanguageList } from '@yiwen-ai/store'
import { useMemo } from 'react'

export function useCreationViewer(
  _gid: string | null | undefined,
  _cid: string | null | undefined
) {
  const { creation, error, isLoading, refresh } = useCreation(_gid, _cid)
  const { languageList } = useLanguageList()
  const currentLanguage = useMemo(
    () => languageList?.find(({ code }) => code === creation?.language),
    [creation?.language, languageList]
  )

  return {
    isLoading,
    error,
    creation,
    currentLanguage,
    refresh,
  } as const
}
