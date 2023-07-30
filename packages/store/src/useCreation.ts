import { type JSONContent } from '@tiptap/core'
import { type URLSearchParamsInit } from '@yiwen-ai/util'
import { useCallback, useEffect, useRef, useState } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import { encode } from './CBOR'
import { useLogger } from './logger'
import { useFetcher } from './useFetcher'
import { useMyDefaultGroup } from './useGroup'

export interface QueryCreation {
  gid: Uint8Array | string
  id: Uint8Array | string
  fields?: string[]
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

const toKey = (query: QueryCreation): [string, URLSearchParamsInit] => [
  path,
  {
    gid: query.gid.toString(),
    id: query.id.toString(),
    fields: query.fields?.join(','),
  },
]

export function useCreation(query: QueryCreation) {
  const logger = useLogger()
  const fetcher = useFetcher()
  const [key] = useState(() => toKey(query))
  const { data, isLoading, mutate } = useSWR<CreationOutput>(
    fetcher && key,
    fetcher?.get ?? null
  )

  const update = useCallback(
    async (input: UpdateCreationInput) => {
      if (!fetcher) return logger.error('fetcher is not ready', { url: path })
      const item = await fetcher.patch<CreationOutput>(path, input)
      mutate(item)
    },
    [fetcher, logger, mutate]
  )

  const _delete = useCallback(async () => {
    if (!fetcher) return logger.error('fetcher is not ready', { url: path })
    await fetcher.delete(path, key[1])
    mutate(Promise.resolve(undefined)) // TODO: mutate to undefined
  }, [fetcher, key, logger, mutate])

  return {
    creation: data,
    isLoading,
    update,
    delete: _delete,
  }
}

interface Draft extends Omit<CreateCreationInput, 'gid' | 'content'> {
  gid: Uint8Array | undefined
  content: JSONContent | undefined
}

export function useAddCreation() {
  const logger = useLogger()
  const fetcher = useFetcher()
  const { mutate } = useSWRConfig()

  const gid = useMyDefaultGroup()?.id

  const [initialDraft] = useState<Draft>(() => ({
    gid,
    title: '',
    content: undefined,
    description: 'description...',
    summary: 'summary - wiwi',
    language: 'eng',
    original_url: 'https://www.yiwen.ltd/',
    cover: 'https://placehold.co/600x400',
    license: 'https://www.yiwen.ltd/',
  }))

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
      if (!fetcher) return logger.error('fetcher is not ready', { url: path })
      const draft = draftRef.current as Required<Draft>
      const input: CreateCreationInput = {
        ...draft,
        gid: draft.gid as Uint8Array,
        content: encode(draft.content),
      }
      const { result: item } = await fetcher.post<{ result: CreationOutput }>(
        path,
        input
      )
      mutate(toKey(item), item)
      return item
    } finally {
      setIsSaving(false)
    }
  }, [fetcher, logger, mutate])

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
