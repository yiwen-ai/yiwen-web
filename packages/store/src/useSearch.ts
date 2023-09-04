import { useCallback } from 'react'
import useSWR, { type SWRConfiguration } from 'swr'
import { Xid } from 'xid-ts'
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
      params: Record<keyof SearchInput, string | null | undefined>,
      signal: AbortSignal | null | undefined = null
    ) => {
      return request<{ result: SearchOutput }>(path, params, {
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
  _keyword: string | null | undefined,
  _language: string | null | undefined,
  _gid: Uint8Array | string | null | undefined
) {
  const { search } = useSearchAPI()

  const getKey = useCallback(() => {
    if (_keyword == null) return null
    const params: Record<keyof SearchInput, string | null | undefined> = {
      q: _keyword,
      language: _language,
      gid: _gid ? Xid.fromValue(_gid).toString() : undefined,
    }
    return [path, params] as const
  }, [_gid, _keyword, _language])

  const { data, error, mutate, isValidating, isLoading } = useSWR(
    getKey,
    ([path, params]) => search(params),
    { revalidateOnMount: false } as SWRConfiguration
  )

  const refresh = useCallback(
    async () => getKey() && (await mutate())?.result,
    [getKey, mutate]
  )

  return {
    isLoading: isValidating || isLoading,
    error,
    data: data?.result,
    refresh,
  } as const
}
