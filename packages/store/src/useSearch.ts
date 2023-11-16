import { useCallback } from 'react'
import useSWR from 'swr'
import { Xid } from 'xid-ts'
import { type GroupInfo, type ObjectKind } from './common'
import { useFetcher } from './useFetcher'

export interface SearchDocument {
  gid: Uint8Array
  cid: Uint8Array
  language: string
  version: number
  kind: ObjectKind
  title: string
  summary: string
  updated_at: number
  group_info?: GroupInfo
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

export function buildSearchKey(
  item: Pick<SearchDocument, 'kind' | 'gid' | 'cid' | 'language' | 'version'>
) {
  return [
    item.kind,
    Xid.fromValue(item.gid).toString(),
    Xid.fromValue(item.cid).toString(),
    item.language,
    item.version,
  ].join(':')
}

const path = '/search'

export function useSearchAPI() {
  const request = useFetcher()

  const search = useCallback(
    (
      params: Record<keyof SearchInput, string | null | undefined>,
      signal?: AbortSignal
    ) => {
      return request.get<{ result: SearchOutput }>(path, params, signal)
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
    {}
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
