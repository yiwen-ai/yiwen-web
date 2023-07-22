import { type URLSearchParamsInit } from '@yiwen-ai/util'
import { useCallback, useState } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import { useLogger } from './logger'
import { useFetcher } from './useFetcher'

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

export function useAddCreation() {
  const logger = useLogger()
  const fetcher = useFetcher()
  const { mutate } = useSWRConfig()

  return useCallback(
    async (input: CreateCreationInput) => {
      if (!fetcher) return logger.error('fetcher is not ready', { url: path })
      const { result: item } = await fetcher.post<{ result: CreationOutput }>(
        path,
        input
      )
      mutate(toKey(item), item)
      return item
    },
    [fetcher, logger, mutate]
  )
}
