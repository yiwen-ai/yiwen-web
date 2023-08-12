import { type JSONContent } from '@tiptap/core'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import useSWRInfinite from 'swr/infinite'
import { type SetNonNullable } from 'type-fest'
import { Xid } from 'xid-ts'
import { encode } from './CBOR'
import { type GIDPagination, type Page } from './common'
import { useFetcher } from './useFetcher'
import { useMyDefaultGroup } from './useGroup'
import { type CreatePublicationInput } from './usePublication'

export enum CreationStatus {
  Deleted = -2,
  Archived = -1,
  Draft = 0,
  Review = 1,
  Approved = 2,
}

export interface QueryCreation {
  gid: Uint8Array
  id: Uint8Array
  fields: readonly string[]
}

export interface CreateCreationInput {
  gid: Uint8Array
  language?: string
  original_url?: string
  genre?: string[]
  title: string
  description?: string
  cover?: string
  keywords?: string[]
  labels?: string[]
  authors?: string[]
  summary?: string
  content: Uint8Array
  license?: string
}

export interface CreationOutput {
  id: Uint8Array
  gid: Uint8Array
  status: CreationStatus
  rating?: number
  version: number
  language: string
  creator?: Uint8Array
  created_at: number
  updated_at: number
  original_url?: string
  genre?: string[]
  title?: string
  description?: string
  cover?: string
  keywords?: string[]
  labels?: string[]
  authors?: string[]
  reviewers?: Uint8Array[]
  summary?: string
  content?: Uint8Array
  license?: string
}

export interface UpdateCreationInput {
  gid: Uint8Array
  id: Uint8Array
  updated_at: number
  title?: string
  description?: string
  cover?: string
  keywords?: string[]
  labels?: string[]
  authors?: string[]
  summary?: string
  license?: string
}

export interface UpdateCreationStatusInput {
  gid: Uint8Array
  id: Uint8Array
  updated_at: number
  status: CreationStatus
}

const path = '/v1/creation'

export function useCreationAPI() {
  const fetcher = useFetcher()

  return useMemo(() => {
    return {
      get: async (query: QueryCreation) => {
        const item = await fetcher.get<CreationOutput>(path, {
          gid: query.gid.toString(),
          id: query.id.toString(),
          fields: query.fields.join(','),
        })
        return item
      },
      list: async (query: GIDPagination) => {
        const items = await fetcher.post<CreationOutput[]>(
          `${path}/list`,
          query
        )
        return items
      },
      create: async (input: CreateCreationInput) => {
        const { result: item } = await fetcher.post<{
          result: CreationOutput
        }>(path, input)
        return item
      },
      update: async (input: UpdateCreationInput) => {
        const item = await fetcher.patch<CreationOutput>(path, input)
        return item
      },
      delete: async () => {
        await fetcher.delete(path)
        return
      },
    }
  }, [fetcher])
}

export function useCreation(_gid: string | null, _id: string | null) {
  const { create } = useCreationAPI()

  interface Draft extends Omit<CreateCreationInput, 'gid' | 'content'> {
    gid: Uint8Array | undefined
    content: JSONContent | undefined
  }

  const gid = useMyDefaultGroup()?.id

  const initialDraft = useMemo<Draft>(
    () => ({
      gid,
      title: '',
      content: undefined,
      language: 'eng',
    }),
    [gid]
  )

  const [draft, setDraft] = useState(initialDraft)
  const draftRef = useRef(draft)
  draftRef.current = draft

  const updateDraft = useCallback((draft: Partial<Draft>) => {
    setDraft((prev) => ({ ...prev, ...draft }))
  }, [])

  useEffect(() => gid && updateDraft({ gid }), [gid, updateDraft])

  const [isSaving, setIsSaving] = useState(false)

  const isDisabled =
    isSaving || !draft.title.trim() || !draft.content || !draft.gid

  const save = useCallback(async () => {
    try {
      setIsSaving(true)
      const draft = draftRef.current as SetNonNullable<Draft>
      return await create({
        ...draft,
        gid: draft.gid,
        content: encode(draft.content),
      })
    } finally {
      setIsSaving(false)
    }
  }, [create])

  return {
    draft,
    updateDraft,
    isDisabled,
    isSaving,
    save,
  } as const
}

export function buildCreationKey(item: CreationOutput) {
  return [
    Xid.fromValue(item.gid).toString(),
    Xid.fromValue(item.id).toString(),
  ].join(':')
}

function isSameCreation(a: CreationOutput, b: CreationOutput) {
  return (
    Xid.fromValue(a.gid).equals(Xid.fromValue(b.gid)) &&
    Xid.fromValue(a.id).equals(Xid.fromValue(b.id))
  )
}

export function useCreationList({ status, ...query }: GIDPagination) {
  const request = useFetcher()

  const getKey = useCallback(
    (
      index: number,
      previousPageData: Page<CreationOutput> | null
    ): [string, GIDPagination] | null => {
      if (previousPageData && !previousPageData.next_page_token) return null

      return [
        status === CreationStatus.Archived
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
      ([url, body]) => request.post<Page<CreationOutput>>(url, body),
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
    isReleasing: {} as Record<string, boolean>,
  })

  const setDeleting = useCallback(
    (item: CreationOutput, isDeleting: boolean) => {
      setState((prev) => ({
        ...prev,
        isDeleting: {
          ...prev.isDeleting,
          [buildCreationKey(item)]: isDeleting,
        },
      }))
    },
    []
  )
  const setArchiving = useCallback(
    (item: CreationOutput, isArchiving: boolean) => {
      setState((prev) => ({
        ...prev,
        isArchiving: {
          ...prev.isArchiving,
          [buildCreationKey(item)]: isArchiving,
        },
      }))
    },
    []
  )
  const setRestoring = useCallback(
    (item: CreationOutput, isRestoring: boolean) => {
      setState((prev) => ({
        ...prev,
        isRestoring: {
          ...prev.isRestoring,
          [buildCreationKey(item)]: isRestoring,
        },
      }))
    },
    []
  )
  const setReleasing = useCallback(
    (item: CreationOutput, isReleasing: boolean) => {
      setState((prev) => ({
        ...prev,
        isReleasing: {
          ...prev.isReleasing,
          [buildCreationKey(item)]: isReleasing,
        },
      }))
    },
    []
  )

  const isDeleting = useCallback(
    (item: CreationOutput) => {
      return state.isDeleting[buildCreationKey(item)] ?? false
    },
    [state.isDeleting]
  )
  const isArchiving = useCallback(
    (item: CreationOutput) => {
      return state.isArchiving[buildCreationKey(item)] ?? false
    },
    [state.isArchiving]
  )
  const isRestoring = useCallback(
    (item: CreationOutput) => {
      return state.isRestoring[buildCreationKey(item)] ?? false
    },
    [state.isRestoring]
  )
  const isReleasing = useCallback(
    (item: CreationOutput) => {
      return state.isReleasing[buildCreationKey(item)] ?? false
    },
    [state.isReleasing]
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
  const releaseItem = useCallback(
    async (item: CreationOutput) => {
      try {
        setReleasing(item, true)
        const body: CreatePublicationInput = {
          gid: item.gid,
          cid: item.id,
          language: item.language,
          version: item.version,
        }
        await request.post<{
          result: CreationOutput
        }>(`${path}/release`, body)
        mutate()
      } finally {
        setReleasing(item, false)
      }
    },
    [request, mutate, setReleasing]
  )

  const archiveItem = useCallback(
    async (item: CreationOutput) => {
      try {
        setArchiving(item, true)
        const body: UpdateCreationStatusInput = {
          gid: item.gid,
          id: item.id,
          updated_at: item.updated_at,
          status: CreationStatus.Archived,
        }
        await request.patch<{
          result: CreationOutput
        }>(`${path}/archive`, body)
        mutate((prev) =>
          prev?.map((page): typeof page => ({
            ...page,
            result: page.result.filter((_item) => !isSameCreation(_item, item)),
          }))
        )
      } finally {
        setArchiving(item, false)
      }
    },
    [request, mutate, setArchiving]
  )

  const restoreItem = useCallback(
    async (item: CreationOutput) => {
      try {
        setRestoring(item, true)
        const body: UpdateCreationStatusInput = {
          gid: item.gid,
          id: item.id,
          updated_at: item.updated_at,
          status: CreationStatus.Draft,
        }
        await request.patch<{
          result: CreationOutput
        }>(`${path}/redraft`, body)
        mutate((prev) =>
          prev?.map((page): typeof page => ({
            ...page,
            result: page.result.filter((_item) => !isSameCreation(_item, item)),
          }))
        )
      } finally {
        setRestoring(item, false)
      }
    },
    [request, mutate, setRestoring]
  )

  const deleteItem = useCallback(
    async (item: CreationOutput) => {
      try {
        setDeleting(item, true)
        await request.delete(path, {
          gid: Xid.fromValue(item.gid).toString(),
          id: Xid.fromValue(item.id).toString(),
        })
        mutate((prev) =>
          prev?.map((page): typeof page => ({
            ...page,
            result: page.result.filter((_item) => !isSameCreation(_item, item)),
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
    isReleasing,
    loadMore,
    refresh,
    releaseItem,
    archiveItem,
    restoreItem,
    deleteItem,
  }
}
