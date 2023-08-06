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
    if (!fetcher) {
      // TODO: assert fetcher is ready
      // logger.error('fetcher is not ready', { url: path })
      return null
    }
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

export function useAddCreation() {
  const create = useCreationAPI()?.create

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
    // TODO: assert create is ready
    if (!create) throw new Error('create is not ready')
    try {
      setIsSaving(true)
      const draft = draftRef.current as SetNonNullable<Draft>
      return create({
        ...draft,
        gid: draft.gid,
        content: encode(draft.content),
      })
    } finally {
      setIsSaving(false)
    }
  }, [create])

  const reset = useCallback(() => {
    setDraft(initialDraft)
  }, [initialDraft])

  return {
    draft,
    updateDraft,
    isDisabled,
    isSaving,
    setIsSaving,
    save,
    reset,
  } as const
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

  const setDeleting = useCallback((id: Uint8Array, isDeleting: boolean) => {
    setState((prev) => ({
      ...prev,
      isDeleting: {
        ...prev.isDeleting,
        [Xid.fromValue(id).toString()]: isDeleting,
      },
    }))
  }, [])
  const setArchiving = useCallback((id: Uint8Array, isArchiving: boolean) => {
    setState((prev) => ({
      ...prev,
      isArchiving: {
        ...prev.isArchiving,
        [Xid.fromValue(id).toString()]: isArchiving,
      },
    }))
  }, [])
  const setRestoring = useCallback((id: Uint8Array, isRestoring: boolean) => {
    setState((prev) => ({
      ...prev,
      isRestoring: {
        ...prev.isRestoring,
        [Xid.fromValue(id).toString()]: isRestoring,
      },
    }))
  }, [])
  const setReleasing = useCallback((id: Uint8Array, isReleasing: boolean) => {
    setState((prev) => ({
      ...prev,
      isReleasing: {
        ...prev.isReleasing,
        [Xid.fromValue(id).toString()]: isReleasing,
      },
    }))
  }, [])

  const isDeleting = useCallback(
    (item: Pick<CreationOutput, 'id'>) => {
      return state.isDeleting[Xid.fromValue(item.id).toString()] ?? false
    },
    [state.isDeleting]
  )
  const isArchiving = useCallback(
    (item: Pick<CreationOutput, 'id'>) => {
      return state.isArchiving[Xid.fromValue(item.id).toString()] ?? false
    },
    [state.isArchiving]
  )
  const isRestoring = useCallback(
    (item: Pick<CreationOutput, 'id'>) => {
      return state.isRestoring[Xid.fromValue(item.id).toString()] ?? false
    },
    [state.isRestoring]
  )
  const isReleasing = useCallback(
    (item: Pick<CreationOutput, 'id'>) => {
      return state.isReleasing[Xid.fromValue(item.id).toString()] ?? false
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
        setReleasing(item.id, true)
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
        setReleasing(item.id, false)
      }
    },
    [request, mutate, setReleasing]
  )

  const archiveItem = useCallback(
    async (item: Pick<CreationOutput, 'gid' | 'id' | 'updated_at'>) => {
      try {
        setArchiving(item.id, true)
        const gid2 = Xid.fromValue(item.gid)
        const id2 = Xid.fromValue(item.id)
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
            result: page.result.filter((item) => {
              return !(
                Xid.fromValue(item.gid).equals(gid2) &&
                Xid.fromValue(item.id).equals(id2)
              )
            }),
          }))
        )
      } finally {
        setArchiving(item.id, false)
      }
    },
    [request, mutate, setArchiving]
  )

  const restoreItem = useCallback(
    async (item: Pick<CreationOutput, 'gid' | 'id' | 'updated_at'>) => {
      try {
        setRestoring(item.id, true)
        const gid2 = Xid.fromValue(item.gid)
        const id2 = Xid.fromValue(item.id)
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
            result: page.result.filter((item) => {
              return !(
                Xid.fromValue(item.gid).equals(gid2) &&
                Xid.fromValue(item.id).equals(id2)
              )
            }),
          }))
        )
      } finally {
        setRestoring(item.id, false)
      }
    },
    [request, mutate, setRestoring]
  )

  const deleteItem = useCallback(
    async (item: Pick<CreationOutput, 'gid' | 'id'>) => {
      try {
        setDeleting(item.id, true)
        const gid2 = Xid.fromValue(item.gid)
        const id2 = Xid.fromValue(item.id)
        await request.delete(path, {
          gid: gid2.toString(),
          id: id2.toString(),
        })
        mutate((prev) =>
          prev?.map((page): typeof page => ({
            ...page,
            result: page.result.filter((item) => {
              return !(
                Xid.fromValue(item.gid).equals(gid2) &&
                Xid.fromValue(item.id).equals(id2)
              )
            }),
          }))
        )
      } finally {
        setDeleting(item.id, false)
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
