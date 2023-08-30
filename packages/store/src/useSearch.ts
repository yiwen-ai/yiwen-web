import { useCallback } from 'react'
import useSWR, { type SWRConfiguration } from 'swr'
import { type GroupInfo } from './common'
import { RequestMethod, useFetcher } from './useFetcher'

export interface SearchDocument {
  gid: Uint8Array
  cid: Uint8Array
  language: string
  version: number
  kind: number
  title: string
  summary: string
  group?: GroupInfo
}

export interface SearchOutput {
  hits: SearchDocument[] | null
  languages: { [key: string]: number }
}

export interface SearchInput {
  q: string
  language?: string
  gid?: Uint8Array
}

const path = '/search'

export function useSearchAPI() {
  const request = useFetcher()

  const search = useCallback(
    (
      params: Record<keyof SearchInput, string | undefined>,
      signal: AbortSignal | null | undefined = null
    ) => {
      return request<{ result: SearchOutput }>(`${path}`, params, {
        method: RequestMethod.GET,
        signal,
      })
    },
    [request]
  )

  return {
    search,
  } as const
}

export function useSearch(
  params: Record<keyof SearchInput, string | undefined>
) {
  const { search } = useSearchAPI()

  const getKey = useCallback(() => {
    if (!params.q) return null
    return [path, params] as const
  }, [params])

  const { data, error, mutate, isValidating, isLoading } = useSWR(
    getKey,
    ([, params]) => search(params),
    { revalidateOnMount: false } as SWRConfiguration
  )

  const refresh = useCallback(
    async (data?: ReturnType<typeof search>) =>
      getKey() && (await mutate(data, !data))?.result,
    [getKey, mutate]
  )

  return {
    isLoading: isValidating || isLoading,
    error,
    data: data?.result,
    refresh,
  } as const
}
