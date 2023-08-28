import { compact, groupBy, uniq, without } from 'lodash-es'
import { useCallback, useMemo } from 'react'
import useSWR from 'swr'
import { useAuth } from './AuthContext'
import { useFetcher } from './useFetcher'

export interface Language {
  code: string
  name: string
  nativeName: string
}

export function useLanguageList() {
  const fetcher = useFetcher()

  const { data, error, isValidating, isLoading } = useSWR<{
    result: [string, string, string][]
  }>('/languages', fetcher)

  const languageList = useMemo(() => {
    return data?.result.map<Language>(([code, name, nativeName]) => ({
      code,
      name,
      nativeName,
    }))
  }, [data?.result])

  return {
    languageList,
    error,
    isLoading: isValidating || isLoading,
  }
}

export function useLanguageProcessor(
  languageList: Language[] | undefined,
  currentLanguageCode: string | null | undefined,
  originalLanguageCode: string | null | undefined,
  translatedLanguageCodeList: string[] | undefined
) {
  const locale = useAuth().user?.locale

  const preferredLanguageCode = useMemo(() => {
    return uniq(
      compact(
        without(
          [originalLanguageCode, locale, 'eng', 'zho'],
          currentLanguageCode
        )
      )
    )[0]
  }, [currentLanguageCode, locale, originalLanguageCode])

  const isPreferred = useCallback(
    (lang: Language) => lang.code === preferredLanguageCode,
    [preferredLanguageCode]
  )

  const isCurrent = useCallback(
    (lang: Language) => lang.code === currentLanguageCode,
    [currentLanguageCode]
  )

  const isOriginal = useCallback(
    (lang: Language) => lang.code === originalLanguageCode,
    [originalLanguageCode]
  )

  const isTranslated = useCallback(
    (lang: Language) => translatedLanguageCodeList?.includes(lang.code),
    [translatedLanguageCodeList]
  )

  const preferredLanguage = useMemo(
    () => languageList?.find(isPreferred),
    [isPreferred, languageList]
  )

  const currentLanguage = useMemo(
    () => languageList?.find(isCurrent),
    [isCurrent, languageList]
  )

  const originalLanguage = useMemo(
    () => languageList?.find(isOriginal),
    [isOriginal, languageList]
  )

  const [translatedLanguageList, pendingLanguageList] = useMemo(() => {
    if (!languageList) return []
    const dict = groupBy(
      languageList.filter((lang) => !isOriginal(lang)),
      isTranslated
    )
    return [dict['true'] ?? [], dict['false'] ?? []] as const
  }, [isOriginal, isTranslated, languageList])

  return {
    preferredLanguage,
    currentLanguage,
    originalLanguage,
    translatedLanguageList,
    pendingLanguageList,
    isCurrent,
    isOriginal,
    isTranslated,
  } as const
}
