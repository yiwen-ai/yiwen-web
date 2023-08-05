import { type JSONContent } from '@tiptap/core'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import useSWRInfinite, { type SWRInfiniteKeyLoader } from 'swr/infinite'
import { type SetNonNullable } from 'type-fest'
import { encode } from './CBOR'
import { type GIDPagination } from './common'
import { useFetcher } from './useFetcher'
import { useMyDefaultGroup } from './useGroup'

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
  status?: number
  rating?: number
  version?: number
  language?: string
  creator?: Uint8Array
  created_at?: number
  updated_at?: number
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
      description: 'description...',
      summary: 'summary - wiwi',
      language: 'eng',
      original_url: 'https://www.yiwen.ltd/',
      cover: 'https://placehold.co/600x400',
      license: 'https://www.yiwen.ltd/',
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

export function useCreationList(
  query: GIDPagination,
  fetcher: NonNullable<ReturnType<typeof useFetcher>>
) {
  const getKey: SWRInfiniteKeyLoader<{
    next_page_token: Uint8Array
    result: CreationOutput[]
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
      result: CreationOutput[]
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
