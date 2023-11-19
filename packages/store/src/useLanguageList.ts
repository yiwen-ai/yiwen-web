import { useCallback, useMemo } from 'react'
import useSWR from 'swr'
import { useFetcher } from './useFetcher'

// iso 639-1
const rtlLanguageCodeList1 = [
  'ar', // Arabic
  'he', // Hebrew
  'fa', // Persian
  'ur', // Urdu
  'ks', // Kashmiri
  'ps', // Pashto
  'ug', // Uighur
  'sd', // Sindhi
]

// iso 639-3
const rtlLanguageCodeList3 = [
  'ara', // Arabic
  'heb', // Hebrew
  'fas', // Persian
  'urd', // Urdu
  'kas', // Kashmiri
  'pus', // Pashto
  'uig', // Uighur
  'snd', // Sindhi
]

export function isRTL(languageCode: string) {
  return languageCode?.length == 2
    ? rtlLanguageCodeList1.includes(languageCode)
    : rtlLanguageCodeList3.includes(languageCode)
}

export interface Language {
  code: string
  name: string
  nativeName: string
  dir: string
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
      dir: isRTL(code) ? 'rtl' : 'ltr',
    }))
  }, [data?.result])

  return {
    languageList,
    error,
    isLoading,
    isValidating,
  }
}

export interface UILanguageItem extends Language {
  isOriginal: boolean
  isCurrent: boolean
  isTranslated: boolean
  isProcessing: boolean
  version: number
}

export function useLanguageProcessor(
  _languageList: Language[] | undefined,
  originalLanguageCode: string | null | undefined,
  currentLanguageCode: string | null | undefined,
  translatedLanguageCodeList: [string, number][] | undefined,
  processingLanguageCodeList: string[] | undefined
) {
  const isOriginal = useCallback(
    (lang: Language) => lang.code === originalLanguageCode,
    [originalLanguageCode]
  )

  const isCurrent = useCallback(
    (lang: Language) => lang.code === currentLanguageCode,
    [currentLanguageCode]
  )

  const translatedVersion = useCallback(
    (lang: Language) => {
      const v = (translatedLanguageCodeList ?? []).find(
        ([code]) => code === lang.code
      )
      return v ? v[1] : 0
    },
    [translatedLanguageCodeList]
  )

  const isTranslated = useCallback(
    (lang: Language) =>
      (translatedLanguageCodeList ?? []).some(([code]) => code === lang.code),
    [translatedLanguageCodeList]
  )

  const isProcessing = useCallback(
    (lang: Language) => (processingLanguageCodeList ?? []).includes(lang.code),
    [processingLanguageCodeList]
  )

  const languageList = useMemo(() => {
    return _languageList?.map<UILanguageItem>((lang) => ({
      ...lang,
      isOriginal: isOriginal(lang),
      isCurrent: isCurrent(lang),
      isTranslated: isTranslated(lang),
      isProcessing: isProcessing(lang),
      version: translatedVersion(lang),
    }))
  }, [
    _languageList,
    isCurrent,
    isOriginal,
    isProcessing,
    isTranslated,
    translatedVersion,
  ])

  const originalLanguage = useMemo(
    () => languageList?.find(isOriginal),
    [isOriginal, languageList]
  )

  const currentLanguage = useMemo(
    () => languageList?.find(isCurrent),
    [isCurrent, languageList]
  )

  const [translatedLanguageList, pendingLanguageList] = useMemo(() => {
    if (!languageList) return []
    const translated: UILanguageItem[] = []
    const pending: UILanguageItem[] = []
    languageList.forEach((lang) => {
      if (lang.isOriginal) return
      if (lang.isTranslated) translated.push(lang)
      else pending.push(lang)
    })
    return [translated, pending] as const
  }, [languageList])

  return {
    originalLanguage,
    currentLanguage,
    translatedLanguageList,
    pendingLanguageList,
    isOriginal,
    isCurrent,
    isTranslated,
  } as const
}
