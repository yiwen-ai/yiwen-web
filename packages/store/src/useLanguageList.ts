import { useCallback, useMemo } from 'react'
import useSWR from 'swr'
import { useFetcher } from './useFetcher'

const rtlLanguageCodeList = [
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
  return rtlLanguageCodeList.includes(languageCode)
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
    isLoading: isValidating || isLoading,
  }
}

export interface UILanguageItem extends Language {
  isOriginal: boolean
  isCurrent: boolean
  isTranslated: boolean
  isProcessing: boolean
}

export function useLanguageProcessor(
  _languageList: Language[] | undefined,
  originalLanguageCode: string | null | undefined,
  currentLanguageCode: string | null | undefined,
  translatedLanguageCodeList: string[] | undefined,
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

  const isTranslated = useCallback(
    (lang: Language) => (translatedLanguageCodeList ?? []).includes(lang.code),
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
    }))
  }, [_languageList, isCurrent, isOriginal, isProcessing, isTranslated])

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
