import { omitBy } from 'lodash-es'
import { useCallback, useMemo, useState } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import useSWRInfinite, { unstable_serialize } from 'swr/infinite'
import { Xid } from 'xid-ts'
import { xLanguage } from './AuthContext'
import {
  BytesToBase64Url,
  type GroupInfo,
  type ObjectKind,
  type Page,
  type PostFilePolicy,
  type QueryGIDPagination,
  type QueryIDGIDPagination,
  type QueryPagination,
  type RFP,
  type SubscriptionOutput,
} from './common'
import { useFetcher } from './useFetcher'
import { type MessageOutput, type UpdateMessageInput } from './useMessage'

export enum CollectionStatus {
  Deleted = -2,
  Archived = -1,
  Private = 0,
  Internal = 1,
  Public = 2,
}

export interface CollectionInfo {
  title: string
  summary?: string
  keywords?: string[]
  authors?: string[]
}

export interface CollectionDraft {
  language: string
  context: string
  info: CollectionInfo
  price: number
  creation_price: number
  cover?: string
  __cover_name?: string
}

export interface CreateCollectionInput extends CollectionDraft {
  gid: Uint8Array
  parent?: Uint8Array
}

export interface CollectionOutput {
  id: Uint8Array
  gid: Uint8Array
  status: CollectionStatus
  rating?: number
  updated_at?: number
  cover?: string
  price?: number
  creation_price?: number
  language?: string
  languages?: string[]
  version: number
  info?: CollectionInfo
  i18n_info?: Record<string, CollectionInfo>
  subscription?: SubscriptionOutput
  rfp?: RFP
  subtoken?: string
  group_info?: GroupInfo
}

export interface CollectionFullOutput {
  id: Uint8Array
  gid: Uint8Array
  status: CollectionStatus
  updated_at: number
  cover: string
  price: number
  creation_price: number
  language: string
  languages: string[]
  version: number
  context: string
  info: CollectionInfo
}

export interface QueryCollection {
  gid: Uint8Array
  id: Uint8Array
  fields: string
  language?: string
}

export interface UpdateCollectionInput {
  gid: Uint8Array
  id: Uint8Array
  updated_at: number
  version?: number
  language?: string
  context?: string
  info?: CollectionInfo
  cover?: string
  price?: number
  creation_price?: number
}

export interface AddCollectionChildrenInput {
  gid: Uint8Array
  id: Uint8Array
  cids: Uint8Array[]
  kind: ObjectKind
}

export interface UpdateCollectionChildInput {
  gid: Uint8Array
  id: Uint8Array
  cid: Uint8Array
  ord: number
}

export interface CollectionChildrenOutput {
  parent: Uint8Array
  gid: Uint8Array
  cid: Uint8Array
  kind: ObjectKind
  ord: number
  status: number // (-2, 2]
  rating: number
  updated_at: number
  price: number
  language: string
  version: number
  title: string
  summary: string
  cover: string
}

export interface UpdateCollectionStatusInput {
  gid: Uint8Array
  id: Uint8Array
  updated_at: number
  status: CollectionStatus
}

export function initialCollectionDraft(): CollectionDraft {
  return {
    language: '',
    context: '',
    info: {
      title: '',
      summary: '',
      keywords: [],
      authors: [],
    },
    cover: '',
    price: 0,
    creation_price: 0,
  }
}

export function genFullChildTitle(
  collectionTitle: string,
  child: CollectionChildrenOutput
): string {
  if (
    child.title.includes(collectionTitle) &&
    child.summary &&
    child.summary.length > child.title.length
  ) {
    return child.title.replace(collectionTitle, '').trim() + ' ' + child.summary
  }
  return child.title
}

export function isSameCollection(a: Uint8Array, b: Uint8Array) {
  return Xid.fromValue(a).equals(Xid.fromValue(b))
}

export function buildCollectionKey(gid: Uint8Array, id: Uint8Array) {
  return [Xid.fromValue(gid).toString(), Xid.fromValue(id).toString()].join(':')
}

export function getCollectionInfo(
  item: CollectionOutput
): [string, CollectionInfo | undefined] {
  if (item.i18n_info) {
    const keys = Object.keys(item.i18n_info)

    if (keys.length > 0) {
      for (const key of keys) {
        if (key === xLanguage.current) {
          return [key, item.i18n_info[key]]
        }
      }
      const lang = keys[0] as string
      return [lang, item.i18n_info[lang]]
    }
  }

  return item.info ? [item.language as string, item.info] : ['', undefined]
}

export function getCollectionTitle(item: CollectionOutput): string {
  const [_, info] = getCollectionInfo(item)
  return info?.title || item.info?.title || ''
}

const path = '/v1/collection'

export function useCollectionAPI() {
  const request = useFetcher()

  const readCollection = useCallback(
    (
      params: Record<keyof QueryCollection, string | undefined>,
      signal?: AbortSignal
    ) => {
      return request.get<{ result: CollectionOutput }>(path, params, signal)
    },
    [request]
  )

  const readCollectionFull = useCallback(
    (
      params: Record<keyof QueryCollection, string | undefined>,
      signal?: AbortSignal
    ) => {
      return request.get<{ result: CollectionFullOutput }>(
        `${path}/full_info`,
        params,
        signal
      )
    },
    [request]
  )

  const readCollectionList = useCallback(
    (params: Record<keyof QueryGIDPagination, string | number | undefined>) => {
      return request.get<Page<CollectionOutput>>(
        `${path}/list`,
        Object.assign(params, { page_size: 20, fields: 'info,updated_at' })
      )
    },
    [request]
  )

  const readLatestCollectionList = useCallback(
    (params: Record<keyof QueryPagination, string | number | undefined>) => {
      return request.get<Page<CollectionOutput>>(
        `${path}/list_latest`,
        Object.assign(params, { page_size: 10, fields: 'info,updated_at' })
      )
    },
    [request]
  )

  const readCollectionListByChild = useCallback(
    (params: { gid: string; cid: string }) => {
      return request.get<{ result: CollectionOutput[] }>(
        `${path}/list_by_child`,
        params
      )
    },
    [request]
  )

  const readCollectionChildren = useCallback(
    (
      params: Record<keyof QueryIDGIDPagination, string | number | undefined>
    ) => {
      return request.get<Page<CollectionChildrenOutput>>(
        `${path}/list_children`,
        Object.assign(params, { page_size: 100 })
      )
    },
    [request]
  )

  const readArchivedCollectionList = useCallback(
    (params: Record<keyof QueryGIDPagination, string | number | undefined>) => {
      return request.get<Page<CollectionOutput>>(
        `${path}/list_archived`,
        Object.assign(params, { page_size: 20, fields: 'info,updated_at' })
      )
    },
    [request]
  )

  const readCollectionUploadPolicy = useCallback(
    async (params: Record<keyof QueryCollection, string | undefined>) => {
      return request.get<{ result: PostFilePolicy }>(`${path}/upload`, params)
    },
    [request]
  )

  const createCollection = useCallback(
    async (body: CreateCollectionInput) => {
      const { result } = await request.post<{ result: CollectionOutput }>(
        path,
        omitBy(body, (val) => val == null)
      )
      return result
    },
    [request]
  )

  const updateCollection = useCallback(
    async (body: UpdateCollectionInput) => {
      const { result } = await request.patch<{ result: CollectionOutput }>(
        path,
        omitBy(body, (val) => val == null)
      )
      return result
    },
    [request]
  )

  const deleteCollection = useCallback(
    (gid: Uint8Array | string, id: Uint8Array | string) => {
      return request.delete(path, {
        gid: Xid.fromValue(gid).toString(),
        id: Xid.fromValue(id).toString(),
      })
    },
    [request]
  )

  const updateCollectionStatus = useCallback(
    (body: UpdateCollectionStatusInput) => {
      return request.patch<{ result: CollectionOutput }>(`${path}/status`, body)
    },
    [request]
  )

  const readCollectionInfo = useCallback(
    async (params: Record<keyof QueryCollection, string | undefined>) => {
      return request.get<{ result: MessageOutput }>(`${path}/raw_info`, params)
    },
    [request]
  )

  const updateCollectionInfo = useCallback(
    (body: UpdateMessageInput) => {
      return request.patch<{ result: CollectionOutput }>(
        `${path}/translate_info`,
        body
      )
    },
    [request]
  )

  const addCollectionChildren = useCallback(
    async (body: AddCollectionChildrenInput) => {
      const { result } = await request.post<{ result: Uint8Array[] }>(
        `${path}/child`,
        omitBy(body, (val) => val == null)
      )
      return result
    },
    [request]
  )

  const updateCollectionChild = useCallback(
    async (body: UpdateCollectionChildInput) => {
      const { result } = await request.patch<{ result: boolean }>(
        `${path}/child`,
        omitBy(body, (val) => val == null)
      )
      return result
    },
    [request]
  )

  const removeCollectionChild = useCallback(
    async (params: { gid: string; id: string; cid: string }) => {
      const { result } = await request.delete<{ result: boolean }>(
        `${path}/child`,
        params
      )
      return result
    },
    [request]
  )

  return {
    readCollection,
    readCollectionFull,
    readCollectionList,
    readLatestCollectionList,
    readCollectionListByChild,
    readCollectionChildren,
    readArchivedCollectionList,
    readCollectionUploadPolicy,
    createCollection,
    updateCollection,
    deleteCollection,
    updateCollectionStatus,
    readCollectionInfo,
    updateCollectionInfo,
    addCollectionChildren,
    updateCollectionChild,
    removeCollectionChild,
  } as const
}

export function useCollection(
  _gid: string | null | undefined,
  _cid: string | null | undefined,
  _language?: string | undefined
) {
  const { mutate: mutateGobal } = useSWRConfig()
  const { readCollection } = useCollectionAPI()

  const getKey = useCallback(() => {
    if (!_cid) return null
    const params = {
      id: _cid,
      _language,
    }
    return ['readCollection', params] as const
  }, [_cid, _language])

  const { data, error, mutate, isValidating, isLoading } = useSWR(
    getKey,
    ([_keyPrefix, params]) =>
      readCollection({
        gid: _gid as string,
        id: params.id,
        fields: undefined,
        language: _language,
      }),
    {}
  )

  const getListKey = useCallback(
    (_: unknown, prevPage: Page<CollectionOutput> | null) => {
      if (!_gid) return null
      if (prevPage && !prevPage.next_page_token) return null

      const params = {
        gid: _gid,
        page_token: prevPage?.next_page_token
          ? BytesToBase64Url(prevPage?.next_page_token)
          : undefined,
      }

      return [`${path}/list`, params] as const
    },
    [_gid]
  )

  const refresh = useCallback(async () => {
    if (!getKey()) return

    const result = await mutate()
    if (result) {
      mutateGobal(
        unstable_serialize(getListKey),
        (prev: Page<CollectionOutput>[] | undefined) =>
          prev?.map((page: Page<CollectionOutput>): typeof page => ({
            ...page,
            result: page.result.map((item) =>
              isSameCollection(item.id, result.result.id)
                ? { ...item, ...result.result }
                : item
            ),
          })),
        {
          revalidate: false,
          populateCache: true,
        }
      )
    }

    return result?.result
  }, [getKey, getListKey, mutate, mutateGobal])

  return {
    collection: data?.result,
    error,
    isLoading,
    isValidating,
    refresh,
  } as const
}

export function useCollectionUploadPolicy(
  _gid: string | null | undefined,
  _cid: string | null | undefined
) {
  const { readCollectionUploadPolicy } = useCollectionAPI()

  const getKey = useCallback(() => {
    if (!_gid || !_cid) return null
    const params: Record<keyof QueryCollection, string | undefined> = {
      gid: _gid,
      id: _cid,
      fields: undefined,
      language: undefined,
    }
    return [`${path}/upload`, params] as const
  }, [_cid, _gid])

  const { data, error, mutate, isValidating, isLoading } = useSWR(
    getKey,
    ([, params]) => readCollectionUploadPolicy(params),
    {}
  )

  const refresh = useCallback(
    async () => getKey() && (await mutate())?.result,
    [getKey, mutate]
  )

  return {
    isLoading,
    isValidating,
    error,
    uploadPolicy: data?.result,
    refresh,
  } as const
}

export function useCollectionList(
  _gid: string | null | undefined,
  _status: CollectionStatus.Archived | null | undefined
) {
  const {
    readCollectionList,
    readArchivedCollectionList,
    updateCollectionStatus,
    deleteCollection,
  } = useCollectionAPI()

  const getKey = useCallback(
    (_: unknown, prevPage: Page<CollectionOutput> | null) => {
      if (!_gid) return null
      if (prevPage && !prevPage.next_page_token) return null

      const params: Record<
        keyof QueryGIDPagination,
        string | number | undefined
      > = {
        gid: _gid,
        page_token: prevPage?.next_page_token
          ? BytesToBase64Url(prevPage?.next_page_token)
          : undefined,
        page_size: undefined,
        fields: undefined,
        status: undefined,
      }

      return [
        _status === CollectionStatus.Archived
          ? `${path}/list_archived`
          : `${path}/list`,
        params,
      ] as const
    },
    [_gid, _status]
  )

  const { data, error, mutate, isValidating, isLoading, setSize } =
    useSWRInfinite(
      getKey,
      ([path, params]) =>
        path === '/v1/collection/list_archived'
          ? readArchivedCollectionList(params)
          : readCollectionList(params),
      { revalidateFirstPage: false }
    )

  //#region processing state
  const [state, setState] = useState({
    isDeleting: {} as Record<string, boolean>,
    isArchiving: {} as Record<string, boolean>,
    isRestoring: {} as Record<string, boolean>,
    isPublishing: {} as Record<string, boolean>,
  })

  const setDeleting = useCallback(
    (item: CollectionOutput, isDeleting: boolean) => {
      setState((prev) => ({
        ...prev,
        isDeleting: {
          ...prev.isDeleting,
          [buildCollectionKey(item.gid, item.id)]: isDeleting,
        },
      }))
    },
    []
  )

  const setArchiving = useCallback(
    (item: CollectionOutput, isArchiving: boolean) => {
      setState((prev) => ({
        ...prev,
        isArchiving: {
          ...prev.isArchiving,
          [buildCollectionKey(item.gid, item.id)]: isArchiving,
        },
      }))
    },
    []
  )

  const setRestoring = useCallback(
    (item: CollectionOutput, isRestoring: boolean) => {
      setState((prev) => ({
        ...prev,
        isRestoring: {
          ...prev.isRestoring,
          [buildCollectionKey(item.gid, item.id)]: isRestoring,
        },
      }))
    },
    []
  )

  const setPublishing = useCallback(
    (item: CollectionOutput, isPublishing: boolean) => {
      setState((prev) => ({
        ...prev,
        isPublishing: {
          ...prev.isPublishing,
          [buildCollectionKey(item.gid, item.id)]: isPublishing,
        },
      }))
    },
    []
  )

  const isDeleting = useCallback(
    (item: CollectionOutput) => {
      return state.isDeleting[buildCollectionKey(item.gid, item.id)] ?? false
    },
    [state.isDeleting]
  )

  const isArchiving = useCallback(
    (item: CollectionOutput) => {
      return state.isArchiving[buildCollectionKey(item.gid, item.id)] ?? false
    },
    [state.isArchiving]
  )

  const isRestoring = useCallback(
    (item: CollectionOutput) => {
      return state.isRestoring[buildCollectionKey(item.gid, item.id)] ?? false
    },
    [state.isRestoring]
  )

  const isPublishing = useCallback(
    (item: CollectionOutput) => {
      return state.isPublishing[buildCollectionKey(item.gid, item.id)] ?? false
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
    if (!data || error) return false
    return !!data[data.length - 1]?.next_page_token
  }, [data, error])

  const loadMore = useCallback(() => setSize((size) => size + 1), [setSize])

  const refresh = useCallback(
    async () => getKey(0, null) && (await mutate()),
    [getKey, mutate]
  )
  //#endregion

  //#region actions
  const publishItem = useCallback(
    async (item: CollectionOutput) => {
      try {
        setPublishing(item, true)
        const { result } = await updateCollectionStatus({
          gid: item.gid,
          id: item.id,
          updated_at: item.updated_at ?? 0,
          status: CollectionStatus.Public,
        })
        mutate(
          (prev) =>
            prev?.map((page): typeof page => ({
              ...page,
              result: page.result.map((item) =>
                isSameCollection(item.id, result.id)
                  ? { ...item, ...result }
                  : item
              ),
            })),
          {
            revalidate: false,
            populateCache: true,
          }
        )
      } finally {
        setPublishing(item, false)
      }
    },
    [mutate, updateCollectionStatus, setPublishing]
  )

  const archiveItem = useCallback(
    async (item: CollectionOutput) => {
      try {
        setArchiving(item, true)
        const { result } = await updateCollectionStatus({
          gid: item.gid,
          id: item.id,
          updated_at: item.updated_at ?? 0,
          status: CollectionStatus.Archived,
        })
        mutate(
          (prev) =>
            prev?.map((page): typeof page => ({
              ...page,
              result: page.result.filter(
                (item) => !isSameCollection(item.id, result.id)
              ),
            })),
          {
            revalidate: false,
            populateCache: true,
          }
        )
      } finally {
        setArchiving(item, false)
      }
    },
    [updateCollectionStatus, mutate, setArchiving]
  )

  const restoreItem = useCallback(
    async (item: CollectionOutput) => {
      try {
        setRestoring(item, true)
        const { result } = await updateCollectionStatus({
          gid: item.gid,
          id: item.id,
          updated_at: item.updated_at ?? 0,
          status: CollectionStatus.Private,
        })
        mutate(
          (prev) =>
            prev?.map((page): typeof page => ({
              ...page,
              result: page.result.filter(
                (item) => !isSameCollection(item.id, result.id)
              ),
            })),
          {
            revalidate: false,
            populateCache: true,
          }
        )
      } finally {
        setRestoring(item, false)
      }
    },
    [updateCollectionStatus, mutate, setRestoring]
  )

  const deleteItem = useCallback(
    async (item: CollectionOutput) => {
      try {
        setDeleting(item, true)
        await deleteCollection(item.gid, item.id)
        mutate(
          (prev) =>
            prev?.map((page): typeof page => ({
              ...page,
              result: page.result.filter(
                (_item) => !isSameCollection(_item.id, item.id)
              ),
            })),
          {
            revalidate: false,
            populateCache: true,
          }
        )
      } finally {
        setDeleting(item, false)
      }
    },
    [deleteCollection, mutate, setDeleting]
  )
  //#endregion

  return {
    isLoading,
    isValidating,
    error,
    items,
    hasMore,
    loadMore,
    refresh,
    isDeleting,
    isArchiving,
    isRestoring,
    isPublishing,
    publishItem,
    archiveItem,
    restoreItem,
    deleteItem,
  }
}

export function useLatestCollectionList() {
  const { readLatestCollectionList } = useCollectionAPI()

  const getKey = useCallback(
    (_: unknown, prevPage: Page<CollectionOutput> | null) => {
      if (prevPage && !prevPage.next_page_token) return null

      const params: Record<keyof QueryPagination, string | number | undefined> =
        {
          page_token: prevPage?.next_page_token
            ? BytesToBase64Url(prevPage?.next_page_token)
            : undefined,
          page_size: undefined,
          fields: undefined,
          status: undefined,
        }

      return [`${path}/list_latest`, params] as const
    },
    []
  )

  const { data, error, mutate, isValidating, isLoading, setSize } =
    useSWRInfinite(
      getKey,
      ([path, params]) => readLatestCollectionList(params),
      { revalidateFirstPage: false }
    )

  //#region loading state
  const items = useMemo(() => {
    if (!data) return []
    return data.flatMap((page) => page.result)
  }, [data])

  const hasMore = useMemo(() => {
    if (!data || error) return false
    return !!data[data.length - 1]?.next_page_token
  }, [data, error])

  const loadMore = useCallback(() => setSize((size) => size + 1), [setSize])

  const refresh = useCallback(
    async () => getKey(0, null) && (await mutate()),
    [getKey, mutate]
  )
  //#endregion

  return {
    isLoading,
    isValidating,
    error,
    items,
    hasMore,
    loadMore,
    refresh,
  }
}

export function useCollectionChildren(
  _gid: string | null | undefined,
  _id: string | null | undefined,
  _language?: string | undefined
) {
  const {
    readCollectionChildren,
    addCollectionChildren,
    updateCollectionChild,
    removeCollectionChild,
  } = useCollectionAPI()

  const getKey = useCallback(
    (_: unknown, prevPage: Page<CollectionChildrenOutput> | null) => {
      if (!_gid || !_id) return null
      if (prevPage && !prevPage.next_page_token) return null

      const params: Record<
        keyof QueryIDGIDPagination,
        string | number | undefined
      > = {
        id: _id,
        gid: _gid,
        language: _language || '',
        page_token: prevPage?.next_page_token
          ? BytesToBase64Url(prevPage?.next_page_token)
          : undefined,
        fields: undefined,
        status: undefined,
        page_size: undefined,
      }

      return [`${path}/list_children`, params] as const
    },
    [_gid, _id, _language]
  )

  const { data, error, mutate, isValidating, isLoading, setSize } =
    useSWRInfinite(getKey, ([path, params]) => readCollectionChildren(params), {
      revalidateFirstPage: false,
    })

  //#region loading state
  const [items, itemsLength] = useMemo(() => {
    const result = data ? data.flatMap((page) => page.result) : []
    return [result, result.length]
  }, [data])

  const hasMore = useMemo(() => {
    if (!data || error) return false
    return !!data[data.length - 1]?.next_page_token
  }, [data, error])

  const refresh = useCallback(
    async () => getKey(0, null) && (await mutate()),
    [getKey, mutate]
  )

  const loadMore = useCallback(
    () => (itemsLength === 0 ? refresh() : setSize((size) => size + 1)),
    [setSize, itemsLength, refresh]
  )
  //#endregion

  //#region actions
  const addChildren = useCallback(
    async (body: AddCollectionChildrenInput) => {
      await addCollectionChildren(body)
      loadMore()
    },
    [addCollectionChildren, loadMore]
  )

  const updateChild = useCallback(
    async (body: UpdateCollectionChildInput) => {
      await updateCollectionChild(body)
    },
    [updateCollectionChild]
  )

  const removeChild = useCallback(
    async (params: { gid: string; id: string; cid: string }) => {
      await removeCollectionChild(params)
      mutate(
        (prev) =>
          prev?.map((page): typeof page => ({
            ...page,
            result: page.result.filter(
              (item) =>
                !Xid.fromValue(item.cid).equals(Xid.fromValue(params.cid))
            ),
          })),
        {
          revalidate: false,
          populateCache: true,
        }
      )
    },
    [removeCollectionChild, mutate]
  )
  //#endregion

  return {
    error,
    isLoading,
    isValidating,
    items,
    hasMore,
    loadMore,
    refresh,
    addChildren,
    updateChild,
    removeChild,
  }
}
