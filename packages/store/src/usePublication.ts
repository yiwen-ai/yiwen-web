import { useCallback, useMemo, useState } from 'react'
import useSWRInfinite from 'swr/infinite'
import { Xid } from 'xid-ts'
import { type GIDPagination, type Page } from './common'
import { useFetcher } from './useFetcher'

export enum PublicationStatus {
  Deleted = -2,
  Archived = -1,
  Review = 0,
  Approved = 1,
  Published = 2,
}

export interface PublicationOutput {
  gid: Uint8Array
  cid: Uint8Array
  language: string
  version: number
  rating?: number
  status: PublicationStatus
  creator?: Uint8Array
  created_at: number
  updated_at: number
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

export interface QueryPublication {
  gid: Uint8Array
  cid: Uint8Array
  language: string
  version: number
  fields: readonly string[]
}

export interface CreatePublicationInput {
  gid: Uint8Array
  cid: Uint8Array
  language: string
  version: number
  model?: string
  to_gid?: Uint8Array
  to_language?: string
}

export interface UpdatePublicationStatusInput {
  gid: Uint8Array
  cid: Uint8Array
  language: string
  version: number
  updated_at: number
  status: number
}

const path = '/v1/publication'

export function buildPublicationKey(item: PublicationOutput) {
  return [
    Xid.fromValue(item.gid).toString(),
    Xid.fromValue(item.cid).toString(),
    item.language,
    item.version,
  ].join(':')
}

function isSamePublication(a: PublicationOutput, b: PublicationOutput) {
  return (
    Xid.fromValue(a.gid).equals(Xid.fromValue(b.gid)) &&
    Xid.fromValue(a.cid).equals(Xid.fromValue(b.cid)) &&
    a.language === b.language &&
    a.version === b.version
  )
}

export function usePublicationList({ status, ...query }: GIDPagination) {
  const request = useFetcher()

  const getKey = useCallback(
    (
      index: number,
      previousPageData: Page<PublicationOutput> | null
    ): [string, GIDPagination] | null => {
      if (previousPageData && !previousPageData.next_page_token) return null

      return [
        status === PublicationStatus.Archived
          ? `${path}/list_archived`
          : `${path}/list`,
        {
          ...query,
          page_token: previousPageData?.next_page_token,
        },
      ]
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(query), status]
  )

  const { data, error, mutate, isValidating, isLoading, setSize } =
    useSWRInfinite(
      getKey,
      ([path, body]) => request.post<Page<PublicationOutput>>(path, body),
      {
        revalidateIfStale: true,
        revalidateOnMount: false,
      }
    )

  //#region processing state
  const [state, setState] = useState({
    isDeleting: {} as Record<string, boolean>,
    isArchiving: {} as Record<string, boolean>,
    isRestoring: {} as Record<string, boolean>,
    isPublishing: {} as Record<string, boolean>,
  })

  const setDeleting = useCallback(
    (item: PublicationOutput, isDeleting: boolean) => {
      setState((prev) => ({
        ...prev,
        isDeleting: {
          ...prev.isDeleting,
          [buildPublicationKey(item)]: isDeleting,
        },
      }))
    },
    []
  )
  const setArchiving = useCallback(
    (item: PublicationOutput, isArchiving: boolean) => {
      setState((prev) => ({
        ...prev,
        isArchiving: {
          ...prev.isArchiving,
          [buildPublicationKey(item)]: isArchiving,
        },
      }))
    },
    []
  )
  const setRestoring = useCallback(
    (item: PublicationOutput, isRestoring: boolean) => {
      setState((prev) => ({
        ...prev,
        isRestoring: {
          ...prev.isRestoring,
          [buildPublicationKey(item)]: isRestoring,
        },
      }))
    },
    []
  )
  const setPublishing = useCallback(
    (item: PublicationOutput, isPublishing: boolean) => {
      setState((prev) => ({
        ...prev,
        isPublishing: {
          ...prev.isPublishing,
          [buildPublicationKey(item)]: isPublishing,
        },
      }))
    },
    []
  )

  const isDeleting = useCallback(
    (item: PublicationOutput) => {
      return state.isDeleting[buildPublicationKey(item)] ?? false
    },
    [state.isDeleting]
  )
  const isArchiving = useCallback(
    (item: PublicationOutput) => {
      return state.isArchiving[buildPublicationKey(item)] ?? false
    },
    [state.isArchiving]
  )
  const isRestoring = useCallback(
    (item: PublicationOutput) => {
      return state.isRestoring[buildPublicationKey(item)] ?? false
    },
    [state.isRestoring]
  )
  const isPublishing = useCallback(
    (item: PublicationOutput) => {
      return state.isPublishing[buildPublicationKey(item)] ?? false
    },
    [state.isPublishing]
  )
  //#endregion

  //#region loading state
  const items = useMemo(() => {
    if (!data) return []
    return data.flatMap((page) => page.result)
  }, [data])

  const hasMore = useMemo(() => {
    if (!data) return true
    return !!data[data.length - 1]?.next_page_token
  }, [data])

  const loadMore = useCallback(() => {
    if (isValidating || isLoading || !hasMore) return
    if (items.length === 0) mutate()
    else setSize((size) => size + 1)
  }, [hasMore, isLoading, isValidating, items.length, mutate, setSize])

  const refresh = useCallback(() => mutate(), [mutate])
  //#endregion

  //#region actions
  const publishItem = useCallback(
    async (item: PublicationOutput) => {
      try {
        setPublishing(item, true)
        const body: UpdatePublicationStatusInput = {
          gid: item.gid,
          cid: item.cid,
          language: item.language,
          version: item.version,
          updated_at: item.updated_at,
          status: PublicationStatus.Published,
        }
        await request.patch<{
          result: PublicationOutput
        }>(`${path}/publish`, body)
        mutate()
      } finally {
        setPublishing(item, false)
      }
    },
    [request, mutate, setPublishing]
  )

  const archiveItem = useCallback(
    async (item: PublicationOutput) => {
      try {
        setArchiving(item, true)
        const body: UpdatePublicationStatusInput = {
          gid: item.gid,
          cid: item.cid,
          language: item.language,
          version: item.version,
          updated_at: item.updated_at,
          status: PublicationStatus.Archived,
        }
        await request.patch<{
          result: PublicationOutput
        }>(`${path}/archive`, body)
        mutate((prev) =>
          prev?.map((page): typeof page => ({
            ...page,
            result: page.result.filter(
              (_item) => !isSamePublication(_item, item)
            ),
          }))
        )
      } finally {
        setArchiving(item, false)
      }
    },
    [request, mutate, setArchiving]
  )

  const restoreItem = useCallback(
    async (item: PublicationOutput) => {
      try {
        setRestoring(item, true)
        const body: UpdatePublicationStatusInput = {
          gid: item.gid,
          cid: item.cid,
          language: item.language,
          version: item.version,
          updated_at: item.updated_at,
          status: PublicationStatus.Review,
        }
        await request.patch<{
          result: PublicationOutput
        }>(`${path}/redraft`, body)
        mutate((prev) =>
          prev?.map((page): typeof page => ({
            ...page,
            result: page.result.filter(
              (_item) => !isSamePublication(_item, item)
            ),
          }))
        )
      } finally {
        setRestoring(item, false)
      }
    },
    [request, mutate, setRestoring]
  )

  const deleteItem = useCallback(
    async (item: PublicationOutput) => {
      try {
        setDeleting(item, true)
        await request.delete(path, {
          gid: Xid.fromValue(item.gid).toString(),
          cid: Xid.fromValue(item.cid).toString(),
          language: item.language,
          version: item.version,
        })
        mutate((prev) =>
          prev?.map((page): typeof page => ({
            ...page,
            result: page.result.filter(
              (_item) => !isSamePublication(_item, item)
            ),
          }))
        )
      } finally {
        setDeleting(item, false)
      }
    },
    [request, mutate, setDeleting]
  )
  //#endregion

  return {
    items,
    error,
    hasMore,
    isLoading: isValidating || isLoading,
    isDeleting,
    isArchiving,
    isRestoring,
    isPublishing,
    loadMore,
    refresh,
    publishItem,
    archiveItem,
    restoreItem,
    deleteItem,
  }
}
