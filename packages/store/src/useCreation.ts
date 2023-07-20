import { type URLSearchParamsInit } from '@yiwen-ai/util'
import { useCallback, useState } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import { useFetcher } from './useFetcher'
import { type CBORRaw, type ID } from './util'

export interface QueryCreation {
  gid: ID
  id: ID
}

export interface CreateCreationInput {
  gid: ID
  language: string
  original_url: string
  genre: string[]
  title: string
  description: string
  cover: string
  keywords: string[]
  labels: string[]
  authors: string[]
  summary: string
  content: CBORRaw
  license: string
}

export interface CreationOutput {
  id: ID
  gid: ID
  status?: number
  rating?: number
  version?: number
  language?: string
  creator?: ID
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
  reviewers?: ID[]
  summary?: string
  content?: CBORRaw
  license?: string
}

export interface UpdateCreationInput {
  gid: ID
  id: ID
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

const path = '/creation'

const toKey = (query: QueryCreation): [string, URLSearchParamsInit] => [
  path,
  {
    gid: query.gid.toString(),
    id: query.id.toString(),
  },
]

export function useCreation(query: QueryCreation) {
  const fetcher = useFetcher()
  const [key] = useState(() => toKey(query))
  const { data, isLoading, mutate } = useSWR<CreationOutput>(key, {
    fetcher: fetcher.get,
    revalidateOnFocus: false,
  })

  const update = useCallback(
    async (input: UpdateCreationInput) => {
      const item = await fetcher.patch<CreationOutput>(path, input)
      mutate(item)
    },
    [fetcher, mutate]
  )

  const _delete = useCallback(async () => {
    await fetcher.delete(path, key[1])
    mutate(Promise.resolve(undefined)) // TODO: mutate to undefined
  }, [fetcher, key, mutate])

  return {
    creation: data,
    isLoading,
    update,
    delete: _delete,
  }
}

export function useAddCreation() {
  const fetcher = useFetcher()
  const { mutate } = useSWRConfig()

  return useCallback(
    async (input: CreateCreationInput) => {
      const item = await fetcher.post<CreationOutput>(path, input)
      mutate(toKey(item), item)
      return item
    },
    [fetcher, mutate]
  )
}
