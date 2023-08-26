import { without } from 'lodash-es'
import { useCallback, useState } from 'react'
import useSWR, { type SWRConfiguration } from 'swr'
import { Xid } from 'xid-ts'
import { type GroupInfo, type Page, type Pagination } from './common'
import { useFetcher } from './useFetcher'
import {
  buildPublicationKey,
  isSamePublication,
  type PublicationOutput,
} from './usePublication'

export interface CollectionOutput {
  id: Uint8Array
  gid: Uint8Array
  cid: Uint8Array
  language: string
  version: number
  updated_at?: number
  title?: string
  labels?: string[]
  group_info?: GroupInfo
}

export interface QueryCollection {
  id: Uint8Array
  fields: string
}

export interface QueryCollectionByCid {
  cid: Uint8Array
  fields: string
}

export interface CreateCollectionInput {
  gid: Uint8Array
  cid: Uint8Array
  language: string
  version: number
  title: string
  labels?: string[]
}

export interface UpdateCollectionInput {
  id: Uint8Array
  updated_at: number
  version?: number
  title?: string
  labels?: string[]
}

const path = '/v1/collection'

export function useCollectionAPI() {
  const request = useFetcher()

  const readCreationCollectionList = useCallback(
    (params: Record<keyof QueryCollectionByCid, string | undefined>) => {
      return request.get<Page<CollectionOutput>>(`${path}/by_cid`, params)
    },
    [request]
  )

  const readCollectionList = useCallback(
    (body: Pagination) => {
      return request.post<Page<CollectionOutput>>(`${path}/list`, body)
    },
    [request]
  )

  const addCollection = useCallback(
    (body: CreateCollectionInput) => {
      return request.post<{ result: CollectionOutput }>(
        '/v1/publication/collect',
        body
      )
    },
    [request]
  )

  const removeCollection = useCallback(
    (params: Record<keyof QueryCollection, string | undefined>) => {
      return request.delete(path, params)
    },
    [request]
  )

  return {
    readCreationCollectionList,
    readCollectionList,
    addCollection,
    removeCollection,
  } as const
}

export function useCreationCollectionList(_cid: string | null | undefined) {
  const { readCreationCollectionList, addCollection, removeCollection } =
    useCollectionAPI()

  const getKey = useCallback(() => {
    if (!_cid) return null

    const params: Record<keyof QueryCollectionByCid, string | undefined> = {
      cid: _cid,
      fields: 'gid,cid,language,version',
    }

    return [`${path}/by_cid`, params] as const
  }, [_cid])

  const { data, error, mutate, isValidating, isLoading } = useSWR(
    getKey,
    ([, params]) => readCreationCollectionList(params),
    { revalidateOnMount: false } as SWRConfiguration
  )

  const refresh = useCallback(
    async () => getKey() && (await mutate()),
    [getKey, mutate]
  )

  const isAdded = useCallback(
    (item: PublicationOutput) => {
      return !!data?.result.some(isSamePublication.bind(null, item))
    },
    [data?.result]
  )

  const [state, setState] = useState({
    isAdding: {} as Record<string, boolean>,
    isRemoving: {} as Record<string, boolean>,
  })

  const setAdding = useCallback(
    (item: PublicationOutput, isAdding: boolean) => {
      setState((prev) => ({
        ...prev,
        isAdding: {
          ...prev.isAdding,
          [buildPublicationKey(item)]: isAdding,
        },
      }))
    },
    []
  )

  const setRemoving = useCallback(
    (item: PublicationOutput | CollectionOutput, isRemoving: boolean) => {
      setState((prev) => ({
        ...prev,
        isRemoving: {
          ...prev.isRemoving,
          [buildPublicationKey(item)]: isRemoving,
        },
      }))
    },
    []
  )

  const isAdding = useCallback(
    (item: PublicationOutput) => {
      return state.isAdding[buildPublicationKey(item)] ?? false
    },
    [state.isAdding]
  )

  const isRemoving = useCallback(
    (item: PublicationOutput | CollectionOutput) => {
      return state.isRemoving[buildPublicationKey(item)] ?? false
    },
    [state.isRemoving]
  )

  const add = useCallback(
    async (item: PublicationOutput) => {
      try {
        setAdding(item, true)
        const { result } = await addCollection({
          gid: item.gid,
          cid: item.cid,
          language: item.language,
          version: item.version,
          title: item.title,
        })
        mutate((prev): typeof prev => ({
          next_page_token: null,
          result: (prev?.result ?? []).concat(result),
        }))
      } finally {
        setAdding(item, false)
      }
    },
    [addCollection, mutate, setAdding]
  )

  const remove = useCallback(
    async (item: PublicationOutput | CollectionOutput) => {
      try {
        setRemoving(item, true)
        const item2 = data?.result.find(isSamePublication.bind(null, item))
        if (!item2) throw new Error('cannot find the collection to be removed')
        await removeCollection({
          id: Xid.fromValue(item2.id).toString(),
          fields: undefined,
        })
        mutate((prev): typeof prev => ({
          next_page_token: null,
          result: without(prev?.result, item2),
        }))
      } finally {
        setRemoving(item, false)
      }
    },
    [data?.result, mutate, removeCollection, setRemoving]
  )

  return {
    isLoading: isValidating || isLoading,
    error,
    collectionList: data?.result,
    refresh,
    isAdded,
    isAdding,
    isRemoving,
    add,
    remove,
  } as const
}
