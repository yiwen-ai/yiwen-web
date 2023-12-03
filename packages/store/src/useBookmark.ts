import { useLoading } from '@yiwen-ai/util'
import { omitBy, without } from 'lodash-es'
import { useCallback, useState } from 'react'
import useSWR from 'swr'
import useSWRInfinite from 'swr/infinite'
import { Xid } from 'xid-ts'
import { useAuth } from './AuthContext'
import { decode, encode } from './CBOR'
import {
  BytesToBase64Url,
  ObjectKind,
  usePagination,
  type GroupInfo,
  type Page,
  type QueryPagination,
} from './common'
import {
  buildCollectionKey,
  getCollectionInfo,
  isSameCollection,
  type CollectionOutput,
} from './useCollection'
import { useFetcher } from './useFetcher'
import {
  buildPublicationKey,
  isSamePublication,
  type PublicationOutput,
} from './usePublication'

export interface BookmarkOutput {
  id: Uint8Array
  gid: Uint8Array
  cid: Uint8Array
  language: string
  version: number
  kind: ObjectKind
  updated_at: number
  title: string
  labels?: string[]
  payload?: Uint8Array
  group_info?: GroupInfo
}

export interface QueryBookmark {
  id: Uint8Array
  fields: string
}

export interface QueryBookmarkByCid {
  cid: Uint8Array
  fields: string
}

export interface CreateBookmarkInput {
  gid: Uint8Array
  cid: Uint8Array
  language: string
  version: number
  title: string
  labels?: string[]
}

export interface UpdateBookmarkInput {
  id: Uint8Array
  updated_at: number
  version?: number
  title?: string
  labels?: string[]
  payload?: Uint8Array
}

export interface BookmarkCollectionPayload {
  gid: Uint8Array // read child group id
  cid: Uint8Array // read child id
  offset: number // read child offset
  title?: string
}

const path = '/v1/bookmark'

export function useBookmarkAPI() {
  const request = useFetcher()

  const readObjectBookmarkList = useCallback(
    (params: Record<keyof QueryBookmarkByCid, string | undefined>) => {
      return request.get<Page<BookmarkOutput>>(`${path}/by_cid`, params)
    },
    [request]
  )

  const readBookmarkList = useCallback(
    (params: Record<keyof QueryPagination, string | number | undefined>) => {
      return request.get<Page<BookmarkOutput>>(
        `${path}/list`,
        Object.assign(params, { page_size: 20 })
      )
    },
    [request]
  )

  const addBookmark = useCallback(
    (kind: ObjectKind, body: CreateBookmarkInput) => {
      const name = kind === 2 ? 'collection' : 'publication'
      return request.post<{ result: BookmarkOutput }>(
        `/v1/${name}/bookmark`,
        body
      )
    },
    [request]
  )

  const removeBookmark = useCallback(
    (params: Record<keyof QueryBookmark, string | undefined>) => {
      return request.delete(path, params)
    },
    [request]
  )

  const updateBookmark = useCallback(
    async (input: UpdateBookmarkInput) => {
      const { result } = await request.patch<{ result: BookmarkOutput }>(
        path,
        omitBy(input, (val) => val == null || val === '')
      )
      return result
    },
    [request]
  )

  return {
    readObjectBookmarkList,
    readBookmarkList,
    addBookmark,
    removeBookmark,
    updateBookmark,
  } as const
}

export function useCollectionBookmarkList(_cid: string | null | undefined) {
  const { isAuthorized } = useAuth()
  const {
    readObjectBookmarkList,
    addBookmark,
    removeBookmark,
    updateBookmark,
  } = useBookmarkAPI()

  const getKey = useCallback(() => {
    if (!isAuthorized || !_cid) return null

    const params: Record<keyof QueryBookmarkByCid, string | undefined> = {
      cid: _cid,
      fields: '',
    }

    return [`${path}/by_cid`, params] as const
  }, [_cid, isAuthorized])

  const { data, error, mutate, isValidating, isLoading } = useSWR(
    getKey,
    ([, params]) => readObjectBookmarkList(params),
    {}
  )

  const refresh = useCallback(
    async () => getKey() && (await mutate()),
    [getKey, mutate]
  )

  const isAdded = useCallback(
    (item: CollectionOutput) => {
      return !!data?.result.some((v) => isSameCollection(v.cid, item.id))
    },
    [data?.result]
  )

  const getPayload = useCallback(
    (id: Uint8Array) => {
      const bookmark = data?.result.find((v) => isSameCollection(v.cid, id))
      if (bookmark && bookmark.payload) {
        try {
          return decode(bookmark.payload) as BookmarkCollectionPayload
        } catch (_e) {
          return undefined
        }
      }
      return undefined
    },
    [data?.result]
  )

  const tryUpdatePayload = useCallback(
    async (id: Uint8Array, input: BookmarkCollectionPayload) => {
      const bookmark = data?.result.find((v) => isSameCollection(v.cid, id))
      if (bookmark) {
        const payload = encode({
          gid: input.gid,
          cid: input.cid,
          offset: input.offset,
          title: input.title,
        })

        const output = await updateBookmark({
          id: bookmark.id,
          updated_at: bookmark.updated_at,
          payload,
        })
        bookmark.updated_at = output.updated_at
        bookmark.payload = payload
      }
      return undefined
    },
    [data?.result, updateBookmark]
  )

  const [state, setState] = useState({
    isAdding: {} as Record<string, boolean>,
    isRemoving: {} as Record<string, boolean>,
  })

  const setAdding = useCallback((item: CollectionOutput, isAdding: boolean) => {
    setState((prev) => ({
      ...prev,
      isAdding: {
        ...prev.isAdding,
        [buildCollectionKey(item.gid, item.id)]: isAdding,
      },
    }))
  }, [])

  const setRemoving = useCallback(
    (item: CollectionOutput, isRemoving: boolean) => {
      setState((prev) => ({
        ...prev,
        isRemoving: {
          ...prev.isRemoving,
          [buildCollectionKey(item.gid, item.id)]: isRemoving,
        },
      }))
    },
    []
  )

  const isAdding = useCallback(
    (item: CollectionOutput) => {
      return state.isAdding[buildCollectionKey(item.gid, item.id)] ?? false
    },
    [state.isAdding]
  )

  const isRemoving = useCallback(
    (item: CollectionOutput) => {
      return state.isRemoving[buildCollectionKey(item.gid, item.id)] ?? false
    },
    [state.isRemoving]
  )

  const add = useCallback(
    async (item: CollectionOutput) => {
      try {
        setAdding(item, true)
        const [language, info] = getCollectionInfo(item)
        if (!language || !info) throw new Error('cannot add the bookmark')
        const { result } = await addBookmark(ObjectKind.Collection, {
          gid: item.gid,
          cid: item.id,
          language,
          version: item.version,
          title: info.title,
        })
        mutate((prev): typeof prev => ({
          next_page_token: null,
          result: (prev?.result ?? []).concat(result),
        }))
        return result
      } finally {
        setAdding(item, false)
      }
    },
    [addBookmark, mutate, setAdding]
  )

  const remove = useCallback(
    async (item: CollectionOutput) => {
      try {
        setRemoving(item, true)
        const item2 = data?.result.find((v) => isSameCollection(v.cid, item.id))
        if (!item2) throw new Error('cannot find the bookmark to be removed')
        await removeBookmark({
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
    [data?.result, mutate, removeBookmark, setRemoving]
  )

  return {
    isLoading,
    isValidating,
    error,
    bookmarkList: data?.result,
    refresh,
    isAdded,
    isAdding,
    isRemoving,
    add,
    remove,
    getPayload,
    tryUpdatePayload,
  } as const
}

export function usePublicationBookmarkList(_cid: string | null | undefined) {
  const { isAuthorized } = useAuth()
  const { readObjectBookmarkList, addBookmark, removeBookmark } =
    useBookmarkAPI()

  const getKey = useCallback(() => {
    if (!isAuthorized || !_cid) return null

    const params: Record<keyof QueryBookmarkByCid, string | undefined> = {
      cid: _cid,
      fields: 'gid,cid,language,version',
    }

    return [`${path}/by_cid`, params] as const
  }, [_cid, isAuthorized])

  const { data, error, mutate, isValidating, isLoading } = useSWR(
    getKey,
    ([, params]) => readObjectBookmarkList(params),
    {}
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
    (item: PublicationOutput | BookmarkOutput, isRemoving: boolean) => {
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
    (item: PublicationOutput | BookmarkOutput) => {
      return state.isRemoving[buildPublicationKey(item)] ?? false
    },
    [state.isRemoving]
  )

  const add = useCallback(
    async (item: PublicationOutput) => {
      try {
        setAdding(item, true)
        const { result } = await addBookmark(ObjectKind.Publication, {
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
        return result
      } finally {
        setAdding(item, false)
      }
    },
    [addBookmark, mutate, setAdding]
  )

  const remove = useCallback(
    async (item: PublicationOutput | BookmarkOutput) => {
      try {
        setRemoving(item, true)
        const item2 = data?.result.find(isSamePublication.bind(null, item))
        if (!item2) throw new Error('cannot find the bookmark to be removed')
        await removeBookmark({
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
    [data?.result, mutate, removeBookmark, setRemoving]
  )

  return {
    isLoading,
    isValidating,
    error,
    bookmarkList: data?.result,
    refresh,
    isAdded,
    isAdding,
    isRemoving,
    add,
    remove,
  } as const
}

export function useBookmarkList() {
  const { isAuthorized } = useAuth()
  const { readBookmarkList, removeBookmark } = useBookmarkAPI()

  const getKey = useCallback(
    (_: unknown, prevPage: Page<BookmarkOutput> | null) => {
      if (!isAuthorized) return null
      if (prevPage && !prevPage.next_page_token) return null
      const page_token = prevPage?.next_page_token
        ? BytesToBase64Url(prevPage?.next_page_token)
        : undefined
      const params: Record<keyof QueryPagination, string | number | undefined> =
        {
          page_size: undefined,
          page_token,
          fields: undefined,
          status: undefined,
        }
      return [`${path}/list`, params] as const
    },
    [isAuthorized]
  )

  const { mutate, ...response } = useSWRInfinite(
    getKey,
    ([, params]) => readBookmarkList(params),
    { revalidateFirstPage: false }
  )

  const [setRemoving, isRemoving] = useLoading((item: BookmarkOutput) =>
    buildPublicationKey(item)
  )

  const remove = useCallback(
    async (item: BookmarkOutput) => {
      try {
        setRemoving(item, true)
        await removeBookmark({
          id: Xid.fromValue(item.id).toString(),
          fields: undefined,
        })
        mutate((prev) =>
          prev?.map((page): typeof page => ({
            ...page,
            result: without(page.result, item),
          }))
        )
      } finally {
        setRemoving(item, false)
      }
    },
    [mutate, removeBookmark, setRemoving]
  )

  return {
    ...usePagination({ getKey, mutate, ...response }),
    isRemoving,
    remove,
  } as const
}
