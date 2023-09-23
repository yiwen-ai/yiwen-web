import { type JSONContent } from '@tiptap/core'
import { omitBy } from 'lodash-es'
import { useCallback, useMemo, useState } from 'react'
import useSWR, { type SWRConfiguration } from 'swr'
import useSWRInfinite from 'swr/infinite'
import { Xid } from 'xid-ts'
import { encode } from './CBOR'
import {
  type GIDPagination,
  type GroupInfo,
  type Page,
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
  fields: readonly string[]
}

export interface CreateCreationInput {
  gid: Uint8Array
  title: string
  content: Uint8Array
  language: string
  original_url?: string
  genre?: string[]
  cover?: string
  keywords?: string[]
  labels?: string[]
  authors?: string[]
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
  __isReady: boolean
  gid: Uint8Array | undefined
  id: Uint8Array | undefined
  language: string | undefined
  updated_at: number | undefined
  title: string
  content: JSONContent | undefined
}

const path = '/v1/creation'

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

  const createCreation = useCallback(
    async (draft: CreationDraft) => {
      if (
        !draft.gid ||
        !draft.language ||
        !draft.title.trim() ||
        !draft.content
      ) {
        throw new Error(
          'group id, language, title and content are required to create a creation'
        )
      }
      const body: CreateCreationInput = {
        ...draft,
        gid: draft.gid,
        language: draft.language,
        title: draft.title.trim(),
        content: encode(draft.content),
      }
      const { result } = await request.post<{ result: CreationOutput }>(
        path,
        body
      )
      return result
    },
    [request]
  )

  const updateCreation = useCallback(
    async (draft: CreationDraft) => {
      if (
        !draft.gid ||
        !draft.id ||
        !draft.language ||
        !draft.updated_at ||
        !draft.title.trim() ||
        !draft.content
      ) {
        throw new Error(
          'group id, creation id, language, updated_at, title and content are required to update a creation'
        )
      }
      const body1: UpdateCreationContentInput = {
        gid: draft.gid,
        id: draft.id,
        language: draft.language,
        updated_at: draft.updated_at,
        content: encode(draft.content),
      }
      const { result: result1 } = await request.put<{ result: CreationOutput }>(
        `${path}/update_content`,
        body1
      )
      const body2: UpdateCreationInput = {
        ...draft,
        gid: result1.gid,
        id: result1.id,
        updated_at: result1.updated_at,
        title: draft.title.trim(),
      }
      const { result } = await request.patch<{ result: CreationOutput }>(
        path,
        omitBy(body2, (val) => val == null || val === '')
      )
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
    createCreation,
    updateCreation,
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

  const {
    data: { result: creation } = {},
    error,
    mutate,
    isValidating,
    isLoading,
  } = useSWR(getKey, ([path, params]) => readCreation(params), {
    revalidateOnMount: false,
  } as SWRConfiguration)

  const refresh = useCallback(
    async () => getKey() && (await mutate())?.result,
    [getKey, mutate]
  )

  return {
    creation,
    error,
    isLoading: isValidating || isLoading,
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
      { revalidateOnMount: false, revalidateFirstPage: false }
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
    if (!data) return false
    return !!data[data.length - 1]?.next_page_token
  }, [data])

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
        mutate((prev) =>
          prev?.map((page): typeof page => ({
            ...page,
            result: page.result.map((item) =>
              isSameCreation(item, result) ? result : item
            ),
          }))
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
        mutate((prev) =>
          prev?.map((page): typeof page => ({
            ...page,
            result: page.result.filter((item) => !isSameCreation(item, result)),
          }))
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
        mutate((prev) =>
          prev?.map((page): typeof page => ({
            ...page,
            result: page.result.filter((item) => !isSameCreation(item, result)),
          }))
        )
      } finally {
        setRestoring(item, false)
      }
    },
    [mutate, restoreCreation, setRestoring]
  )

  const deleteItem = useCallback(
    async (item: CreationOutput) => {
      try {
        setDeleting(item, true)
        await deleteCreation(item.gid, item.id)
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
    [deleteCreation, mutate, setDeleting]
  )
  //#endregion

  return {
    isLoading: isValidating || isLoading,
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
