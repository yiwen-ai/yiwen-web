import { type JSONContent } from '@tiptap/core'
import { isEqual, omitBy } from 'lodash-es'
import { useCallback, useMemo, useState } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import useSWRInfinite, { unstable_serialize } from 'swr/infinite'
import { Xid } from 'xid-ts'
import {
  type GIDPagination,
  type GroupInfo,
  type Page,
  type PostFilePolicy,
  type UserInfo,
} from './common'
import { RequestMethod, useFetcher } from './useFetcher'
import {
  DEFAULT_MODEL,
  useReadPublicationByJob,
  type CreatePublicationInput,
  type PublicationOutput,
} from './usePublication'

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
  fields: string
}

export interface CreateCreationInput {
  gid: Uint8Array
  title: string
  content: Uint8Array
  language: string
  original_url?: string | undefined
  genre?: string[]
  cover?: string
  keywords?: string[]
  labels?: string[]
  authors?: string[]
  license?: string
  parent?: Uint8Array
  price?: number
}

export interface CreationOutput {
  id: Uint8Array
  gid: Uint8Array
  status: CreationStatus
  rating?: number
  price?: number
  version: number
  language: string
  creator?: Uint8Array
  created_at: number
  updated_at: number
  original_url?: string
  genre?: string[]
  title?: string
  cover?: string
  keywords?: string[]
  labels?: string[]
  authors?: string[]
  reviewers?: Uint8Array[]
  summary?: string
  content: Uint8Array
  license?: string
  creator_info?: UserInfo
  group_info?: GroupInfo
}

export interface UpdateCreationInput {
  gid: Uint8Array
  id: Uint8Array
  updated_at: number
  price?: number
  title?: string
  cover?: string
  keywords?: string[]
  labels?: string[]
  authors?: string[]
  summary?: string
  license?: string
}

export interface UpdateCreationContentInput {
  gid: Uint8Array
  id: Uint8Array
  updated_at: number
  language: string
  content: Uint8Array
}

export interface UpdateCreationStatusInput {
  gid: Uint8Array
  id: Uint8Array
  updated_at: number
  status: CreationStatus
}

export interface ScrapingInput {
  gid: Uint8Array
  url: string
}

export interface ScrapingOutput {
  id: Uint8Array
  url: string
  src?: string
  title?: string
  meta?: Record<string, string>
  content?: Uint8Array
}

export interface CreationDraft {
  title: string
  content?: JSONContent | undefined
  original_url?: string
  cover?: string
  keywords?: string[]
  labels?: string[]
  authors?: string[]
  summary?: string
  license?: string
  price?: number
  parent?: Uint8Array | undefined
  __cover_name?: string
}

const path = '/v1/creation'

export function initialCreationDraft(): CreationDraft {
  return {
    title: '',
  }
}

export function diffCreationDraft(
  src: CreationOutput,
  draft: CreationDraft
): UpdateCreationInput | null {
  if (!src || !draft) return null
  const rt: UpdateCreationInput = {
    gid: src.gid,
    id: src.id,
    updated_at: src.updated_at,
  }
  if (draft.price != null && src.price != draft.price) {
    rt.price = draft.price
  }
  if (src.title != draft.title) {
    rt.title = draft.title
  }
  if (draft.cover && src.cover != draft.cover) {
    rt.cover = draft.cover
  }
  if (draft.summary && src.summary != draft.summary) {
    rt.summary = draft.summary
  }
  if (draft.license && src.license != draft.license) {
    rt.license = draft.license
  }
  if (draft.keywords && !isEqual(src.keywords, draft.keywords)) {
    rt.keywords = draft.keywords
  }
  if (draft.labels && !isEqual(src.labels, draft.labels)) {
    rt.labels = draft.labels
  }
  if (draft.authors && !isEqual(src.authors, draft.authors)) {
    rt.authors = draft.authors
  }

  return Object.keys(rt).length > 3 ? rt : null
}

export function useCreationAPI() {
  const request = useFetcher()
  const readPublicationByJob = useReadPublicationByJob()

  const readCreation = useCallback(
    (params: Record<keyof QueryCreation, string | undefined>) => {
      return request.get<{ result: CreationOutput }>(path, params)
    },
    [request]
  )

  const readCreationList = useCallback(
    (params: { gid: string; page_token: Uint8Array | null | undefined }) => {
      const body: GIDPagination = {
        gid: Xid.fromValue(params.gid),
        page_token: params.page_token,
      }
      return request.post<Page<CreationOutput>>(`${path}/list`, body)
    },
    [request]
  )

  const readArchivedCreationList = useCallback(
    (params: { gid: string; page_token: Uint8Array | null | undefined }) => {
      const body: GIDPagination = {
        gid: Xid.fromValue(params.gid),
        page_token: params.page_token,
      }
      return request.post<Page<CreationOutput>>(`${path}/list_archived`, body)
    },
    [request]
  )

  const readCreationUploadPolicy = useCallback(
    async (params: Record<keyof QueryCreation, string | undefined>) => {
      return request.get<{ result: PostFilePolicy }>(`${path}/upload`, params)
    },
    [request]
  )

  const createCreation = useCallback(
    async (input: CreateCreationInput) => {
      const { result } = await request.post<{ result: CreationOutput }>(
        path,
        omitBy(input, (val) => val == null || val === '')
      )
      return result
    },
    [request]
  )

  const updateCreation = useCallback(
    async (input: UpdateCreationInput) => {
      const { result } = await request.patch<{ result: CreationOutput }>(
        path,
        omitBy(input, (val) => val == null || val === '')
      )
      return result
    },
    [request]
  )

  const updateCreationContent = useCallback(
    async (input: UpdateCreationContentInput) => {
      const { result } = await request.put<{
        result: CreationOutput
      }>(`${path}/update_content`, input)
      return result
    },
    [request]
  )

  const deleteCreation = useCallback(
    (gid: Uint8Array | string, id: Uint8Array | string) => {
      return request.delete(path, {
        gid: Xid.fromValue(gid).toString(),
        id: Xid.fromValue(id).toString(),
      })
    },
    [request]
  )

  const releaseCreation = useCallback(
    async (body: CreatePublicationInput) => {
      const { job, result } = await request.post<{
        job: string
        result: PublicationOutput | null
      }>(`${path}/release`, body)
      return { job, result: result ?? (await readPublicationByJob(job)) }
    },
    [readPublicationByJob, request]
  )

  const archiveCreation = useCallback(
    (body: UpdateCreationStatusInput) => {
      return request.patch<{ result: CreationOutput }>(`${path}/archive`, body)
    },
    [request]
  )

  const restoreCreation = useCallback(
    (body: UpdateCreationStatusInput) => {
      return request.patch<{ result: CreationOutput }>(`${path}/redraft`, body)
    },
    [request]
  )

  const crawlDocument = useCallback(
    (params: Record<keyof ScrapingInput, string>) => {
      return request.get<{ result: ScrapingOutput }>('/v1/scraping', params)
    },
    [request]
  )

  const uploadDocument = useCallback(
    (file: File) => {
      return request<{ result: ScrapingOutput }>('/v1/converting', undefined, {
        method: RequestMethod.POST,
        body: file,
        headers: { 'Content-Type': file.type },
      })
    },
    [request]
  )

  return {
    readCreation,
    readCreationList,
    readArchivedCreationList,
    readCreationUploadPolicy,
    createCreation,
    updateCreation,
    updateCreationContent,
    deleteCreation,
    releaseCreation,
    archiveCreation,
    restoreCreation,
    crawlDocument,
    uploadDocument,
  } as const
}

export function useCreation(
  _gid: string | null | undefined,
  _cid: string | null | undefined
) {
  const { mutate: mutateGobal } = useSWRConfig()
  const { readCreation } = useCreationAPI()

  const getKey = useCallback(() => {
    if (!_gid || !_cid) return null
    const params: Record<keyof QueryCreation, string | undefined> = {
      gid: _gid,
      id: _cid,
      fields: undefined,
    }
    return [path, params] as const
  }, [_cid, _gid])

  const { data, error, mutate, isValidating, isLoading } = useSWR(
    getKey,
    ([path, params]) => readCreation(params),
    {}
  )

  const getListKey = useCallback(
    (_: unknown, prevPage: Page<CreationOutput> | null) => {
      if (!_gid) return null
      if (prevPage && !prevPage.next_page_token) return null

      const params = {
        gid: _gid,
        page_token: prevPage?.next_page_token,
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
        (prev: Page<CreationOutput>[] | undefined) =>
          prev?.map((page: Page<CreationOutput>): typeof page => ({
            ...page,
            result: page.result.map((item) =>
              isSameCreation(item, result.result)
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
    creation: data?.result,
    error,
    isLoading,
    isValidating,
    refresh,
  } as const
}

export function useCreationUploadPolicy(
  _gid: string | null | undefined,
  _cid: string | null | undefined
) {
  const { readCreationUploadPolicy } = useCreationAPI()

  const getKey = useCallback(() => {
    if (!_gid || !_cid) return null
    const params: Record<keyof QueryCreation, string | undefined> = {
      gid: _gid,
      id: _cid,
      fields: undefined,
    }
    return [`${path}/upload`, params] as const
  }, [_cid, _gid])

  const { data, error, mutate, isValidating, isLoading } = useSWR(
    getKey,
    ([, params]) => readCreationUploadPolicy(params),
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

export function useCreationList(
  _gid: string | null | undefined,
  _status: CreationStatus.Archived | null | undefined
) {
  const {
    readCreation,
    readCreationList,
    readArchivedCreationList,
    releaseCreation,
    archiveCreation,
    restoreCreation,
    deleteCreation,
  } = useCreationAPI()

  const getKey = useCallback(
    (_: unknown, prevPage: Page<CreationOutput> | null) => {
      if (!_gid) return null
      if (prevPage && !prevPage.next_page_token) return null

      const params = {
        gid: _gid,
        page_token: prevPage?.next_page_token,
      }

      return [
        _status === CreationStatus.Archived
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
        path === '/v1/creation/list_archived'
          ? readArchivedCreationList(params)
          : readCreationList(params),
      { revalidateFirstPage: false }
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
  const releaseItem = useCallback(
    async (item: CreationOutput) => {
      try {
        setReleasing(item, true)
        await releaseCreation({
          gid: item.gid,
          cid: item.id,
          language: item.language,
          version: item.version,
          model: DEFAULT_MODEL,
        })
        const { result } = await readCreation({
          gid: Xid.fromValue(item.gid).toString(),
          id: Xid.fromValue(item.id).toString(),
          fields: undefined,
        })
        mutate(
          (prev) =>
            prev?.map((page): typeof page => ({
              ...page,
              result: page.result.map((item) =>
                isSameCreation(item, result) ? { ...item, ...result } : item
              ),
            })),
          {
            revalidate: false,
            populateCache: true,
          }
        )
      } finally {
        setReleasing(item, false)
      }
    },
    [mutate, readCreation, releaseCreation, setReleasing]
  )

  const archiveItem = useCallback(
    async (item: CreationOutput) => {
      try {
        setArchiving(item, true)
        const { result } = await archiveCreation({
          gid: item.gid,
          id: item.id,
          updated_at: item.updated_at,
          status: CreationStatus.Archived,
        })
        mutate(
          (prev) =>
            prev?.map((page): typeof page => ({
              ...page,
              result: page.result.filter(
                (item) => !isSameCreation(item, result)
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
    [archiveCreation, mutate, setArchiving]
  )

  const restoreItem = useCallback(
    async (item: CreationOutput) => {
      try {
        setRestoring(item, true)
        const { result } = await restoreCreation({
          gid: item.gid,
          id: item.id,
          updated_at: item.updated_at,
          status: CreationStatus.Draft,
        })
        _status === CreationStatus.Archived
          ? mutate(
              (prev) =>
                prev?.map((page): typeof page => ({
                  ...page,
                  result: page.result.filter(
                    (item) => !isSameCreation(item, result)
                  ),
                })),
              {
                revalidate: false,
                populateCache: true,
              }
            )
          : mutate(
              (prev) =>
                prev?.map((page): typeof page => ({
                  ...page,
                  result: page.result.map((item) =>
                    isSameCreation(item, result) ? { ...item, ...result } : item
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
    [_status, mutate, restoreCreation, setRestoring]
  )

  const deleteItem = useCallback(
    async (item: CreationOutput) => {
      try {
        setDeleting(item, true)
        await deleteCreation(item.gid, item.id)
        mutate(
          (prev) =>
            prev?.map((page): typeof page => ({
              ...page,
              result: page.result.filter(
                (_item) => !isSameCreation(_item, item)
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
    [deleteCreation, mutate, setDeleting]
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
    isReleasing,
    releaseItem,
    archiveItem,
    restoreItem,
    deleteItem,
  }
}

export function useCrawlDocument(_gid: string | null | undefined) {
  const { crawlDocument } = useCreationAPI()

  const [isCrawling, setIsCrawling] = useState(false)

  const crawl = useCallback(
    async (url: string) => {
      if (!_gid) throw new Error('group id is required to create a creation')
      try {
        setIsCrawling(true)
        const gid = Xid.fromValue(_gid)
        const { result } = await crawlDocument({
          gid: gid.toString(),
          url,
        })
        return result
      } finally {
        setIsCrawling(false)
      }
    },
    [_gid, crawlDocument]
  )

  return {
    isCrawling,
    crawl,
  } as const
}

export function useUploadDocument(_gid: string | null | undefined) {
  const { uploadDocument } = useCreationAPI()

  const [isUploading, setIsUploading] = useState(false)

  const upload = useCallback(
    async (file: File) => {
      if (!_gid) throw new Error('group id is required to create a creation')
      try {
        setIsUploading(true)
        const { result } = await uploadDocument(file)
        return result
      } finally {
        setIsUploading(false)
      }
    },
    [_gid, uploadDocument]
  )

  return {
    isUploading,
    upload,
  } as const
}
