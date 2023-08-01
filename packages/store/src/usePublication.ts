import { useCallback, useMemo } from 'react'
import useSWRInfinite, { type SWRInfiniteKeyLoader } from 'swr/infinite'
import { type GIDPagination } from './common'
import { type useFetcher } from './useFetcher'

export interface PublicationOutput {
  gid: Uint8Array
  cid: Uint8Array
  language: string
  version: number
  rating?: number
  status?: number
  creator?: Uint8Array
  created_at?: number
  updated_at?: number
  model?: string
  original_url?: string
  genre?: string[]
  title?: string
  cover?: string
  keywords?: string[]
  authors?: string[]
  summary?: string
  content?: Uint8Array
  license?: string
}

const path = '/v1/publication'

export function usePublicationList(
  query: GIDPagination,
  fetcher: NonNullable<ReturnType<typeof useFetcher>>
) {
  const getKey: SWRInfiniteKeyLoader<{
    next_page_token: Uint8Array
    result: PublicationOutput[]
  }> = (pageIndex, previousPageData) => {
    if (previousPageData && !previousPageData.next_page_token) return null

    return [
      `${path}/list`,
      { gid: query.gid, page_token: previousPageData?.next_page_token },
    ]
  }

  const { data, error, isLoading, isValidating, mutate, setSize } =
    useSWRInfinite<{
      next_page_token: Uint8Array
      result: PublicationOutput[]
    }>(
      getKey,
      ([url, query]: [string, GIDPagination]) => fetcher.post(url, query),
      {
        revalidateIfStale: true,
      }
    )

  const items = useMemo(() => {
    if (!data) return []
    return data.flatMap((page) => page.result)
  }, [data])

  const hasMore = useMemo(() => {
    if (!data) return true
    return !!data[data.length - 1]?.next_page_token
  }, [data])

  const loadMore = useCallback(() => {
    if (isLoading || isValidating || !hasMore) return
    setSize((size) => size + 1)
  }, [hasMore, isLoading, isValidating, setSize])

  return {
    items,
    error,
    hasMore,
    isLoading: isLoading || isValidating,
    mutate,
    loadMore,
  }
}
