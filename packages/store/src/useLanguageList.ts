import { compact, uniq } from 'lodash-es'
import { useMemo } from 'react'
import useSWR from 'swr'
import { useAuth } from './AuthContext'
import { useFetcher } from './useFetcher'

export function useLanguageList() {
  const fetcher = useFetcher()
  const { data, error, isValidating, isLoading } = useSWR<{
    result: [string, string, string][]
  }>('/languages', fetcher.get)

  const { locale } = useAuth().user ?? {}
  const preferredLanguageCodeList = useMemo(
    () => uniq(compact([locale, 'zho', 'eng'])),
    [locale]
  )

  return {
    languageList: data?.result,
    preferredLanguageCodeList,
    error,
    isLoading: isValidating || isLoading,
  }
}
