import { type JSONContent } from '@tiptap/core'
import { omitBy } from 'lodash-es'
import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { useFetcher } from './useFetcher'

export const DEFAULT_MODEL = 'gpt3.5'

export enum PublicationStatus {
  Deleted = -2,
  Archived = -1,
  Review = 0,
  Approved = 1,
  Published = 2,
}

export interface PublicationOutput {
  gid: Uint8Array
  cid: Uint8Array
  language: string
  version: number
  rating?: number
  status: PublicationStatus
  creator?: Uint8Array
  created_at: number
  updated_at: number
  model: string
  original_url?: string
  from_language?: string
  genre?: string[]
  title: string
  cover?: string
  keywords?: string[]
  authors?: string[]
  summary?: string
  content: Uint8Array
  license?: string
  creator_info?: UserInfo
  group_info?: GroupInfo
}

export interface QueryPublication {
  gid: Uint8Array
  cid: Uint8Array
  language: string
  version: number
  fields: readonly string[]
}

export interface CreatePublicationInput {
  gid: Uint8Array
  cid: Uint8Array
  language: string
  version: number
  model: string
  to_gid?: Uint8Array
  to_language?: string
}

export interface UpdatePublicationStatusInput {
  gid: Uint8Array
  cid: Uint8Array
  language: string
  version: number
  updated_at: number
  status: number
}

export interface UpdatePublicationContentInput {
  gid: Uint8Array
  cid: Uint8Array
  language: string
  version: number
  updated_at: number
  content: Uint8Array
}

export interface UpdatePublicationInput {
  gid: Uint8Array
  cid: Uint8Array
  language: string
  version: number
  updated_at: number
  model?: string
  title?: string
  cover?: string
  keywords?: string[]
  summary?: string
}

export interface PublicationDraft {
  __isReady: boolean
  gid: Uint8Array | undefined
  cid: Uint8Array | undefined
  language: string | undefined
  version: number | undefined
  model: string
  updated_at: number | undefined
  title: string
  content: JSONContent | undefined
}

const path = '/v1/publication'

export function usePublicationAPI() {
  const request = useFetcher()

  const readPublication = useCallback(
    (params: Record<keyof QueryPublication, string | number | null>) => {
      return request.get<{ result: PublicationOutput }>(path, params)
    },
    [request]
  )

  const readPublicationList = useCallback(
    (params: { gid: string; page_token: Uint8Array | null | undefined }) => {
      const body: GIDPagination = {
        gid: Xid.fromValue(params.gid),
        page_token: params.page_token,
      }
      return request.post<Page<PublicationOutput>>(`${path}/list`, body)
    },
    [request]
  )

  const readArchivedPublicationList = useCallback(
    (params: { gid: string; page_token: Uint8Array | null | undefined }) => {
      const body: GIDPagination = {
        gid: Xid.fromValue(params.gid),
        page_token: params.page_token,
      }
      return request.post<Page<PublicationOutput>>(
        `${path}/list_archived`,
        body
      )
    },
    [request]
  )

  const readTranslatedPublicationList = useCallback(
    (params: Record<keyof QueryPublication, string | number | null>) => {
      return request.get<{ result: PublicationOutput[] }>(
        `${path}/publish`,
        params
      )
    },
    [request]
  )

  const createPublication = useCallback(
    async (draft: PublicationDraft) => {
      if (
        !draft.gid ||
        !draft.cid ||
        !draft.language ||
        draft.version === undefined
      ) {
        throw new Error(
          'group id, creation id, language and version are required to create a publication'
        )
      }
      const body: CreatePublicationInput = {
        ...draft,
        gid: draft.gid,
        cid: draft.cid,
        language: draft.language,
        version: draft.version,
      }
      const { result } = await request.post<{ result: PublicationOutput }>(
        path,
        body
      )
      return result
    },
    [request]
  )

  const updatePublication = useCallback(
    async (draft: PublicationDraft) => {
      if (
        !draft.gid ||
        !draft.cid ||
        !draft.language ||
        draft.version === undefined ||
        !draft.updated_at ||
        !draft.title.trim() ||
        !draft.content
      ) {
        throw new Error(
          'group id, creation id, language, version, updated_at, title and content are required to update a publication'
        )
      }
      const body1: UpdatePublicationContentInput = {
        gid: draft.gid,
        cid: draft.cid,
        language: draft.language,
        version: draft.version,
        updated_at: draft.updated_at,
        content: encode(draft.content),
      }
      const { result: result1 } = await request.put<{
        result: PublicationOutput
      }>(`${path}/update_content`, body1)
      const body2: UpdatePublicationInput = {
        ...draft,
        gid: result1.gid,
        cid: result1.cid,
        language: result1.language,
        version: result1.version,
        updated_at: result1.updated_at,
        title: draft.title.trim(),
      }
      const { result } = await request.patch<{ result: PublicationOutput }>(
        path,
        omitBy(body2, (val) => val == null || val === '')
      )
      return result
    },
    [request]
  )

  const deletePublication = useCallback(
    (
      gid: Uint8Array | string,
      cid: Uint8Array | string,
      language: string,
      version: number | string
    ) => {
      return request.delete(path, {
        gid: Xid.fromValue(gid).toString(),
        cid: Xid.fromValue(cid).toString(),
        language,
        version,
      })
    },
    [request]
  )

  const publishPublication = useCallback(
    (body: UpdatePublicationStatusInput) => {
      return request.patch<{ result: PublicationOutput }>(
        `${path}/publish`,
        body
      )
    },
    [request]
  )

  const archivePublication = useCallback(
    (body: UpdatePublicationStatusInput) => {
      return request.patch<{ result: PublicationOutput }>(
        `${path}/archive`,
        body
      )
    },
    [request]
  )

  const restorePublication = useCallback(
    (body: UpdatePublicationStatusInput) => {
      return request.patch<{ result: PublicationOutput }>(
        `${path}/redraft`,
        body
      )
    },
    [request]
  )

  return {
    readPublication,
    readPublicationList,
    readArchivedPublicationList,
    readTranslatedPublicationList,
    createPublication,
    updatePublication,
    deletePublication,
    publishPublication,
    archivePublication,
    restorePublication,
  } as const
}

export function usePublication(
  _gid: string | null | undefined,
  _cid: string | null | undefined,
  _language: string | null | undefined,
  _version: number | string | null | undefined
) {
  const { readPublication } = usePublicationAPI()

  const getKey = useCallback(() => {
    if (!_gid || !_cid || !_language || _version == null) return null
    const params: Record<keyof QueryPublication, string | number | null> = {
      gid: _gid,
      cid: _cid,
      language: _language,
      version: _version,
      fields: null,
    }
    return [path, params] as const
  }, [_cid, _gid, _language, _version])

  const {
    data: { result: publication } = {},
    error,
    mutate,
    isValidating,
    isLoading,
  } = useSWR(getKey, ([path, params]) => readPublication(params), {
    revalidateOnMount: false,
  } as SWRConfiguration)

  const refresh = useCallback(
    async () => getKey() && (await mutate())?.result,
    [getKey, mutate]
  )

  return {
    publication,
    error,
    isLoading: isValidating || isLoading,
    refresh,
  } as const
}

export function useTranslatePublication(
  _gid: string | null | undefined,
  _cid: string | null | undefined,
  _language: string | null | undefined,
  _version: number | string | null | undefined
) {
  const request = useFetcher()

  const readPublicationByJob = useReadPublicationByJob()

  const translate = useCallback(
    async (gid: Uint8Array | undefined, language: string | undefined) => {
      if (
        !_gid ||
        !_cid ||
        !_language ||
        _version == null ||
        !gid ||
        !language
      ) {
        throw new Error(
          'group id, creation id, language, version, target group id and target language are required to translate a publication'
        )
      }
      const body: CreatePublicationInput = {
        gid: Xid.fromValue(_gid),
        cid: Xid.fromValue(_cid),
        language: _language,
        version: Number(_version),
        model: DEFAULT_MODEL,
        to_gid: gid,
        to_language: language,
      }
      const { job, result } = await request.post<{
        job: string
        result: PublicationOutput | null
      }>(path, body)
      return result ?? readPublicationByJob(job)
    },
    [_cid, _gid, _language, _version, readPublicationByJob, request]
  )

  return translate
}

export function useTranslatedPublicationList(
  _gid: string | null | undefined,
  _cid: string | null | undefined
) {
  const { readTranslatedPublicationList } = usePublicationAPI()

  const getKey = useCallback(() => {
    if (!_gid || !_cid) return null
    const params: Record<keyof QueryPublication, string | number | null> = {
      gid: _gid,
      cid: _cid,
      language: null,
      version: null,
      fields: null,
    }
    return [`${path}/publish`, params] as const
  }, [_cid, _gid])

  const { data, error, mutate, isValidating, isLoading } = useSWR(
    getKey,
    ([path, params]) => readTranslatedPublicationList(params),
    { revalidateOnMount: false } as SWRConfiguration
  )

  const refresh = useCallback(
    async () => getKey() && (await mutate())?.result,
    [getKey, mutate]
  )

  return {
    publicationList: data?.result,
    error,
    isLoading: isValidating || isLoading,
    refresh,
  } as const
}

export function useReadPublicationByJob() {
  const request = useFetcher()

  const [controller, setController] = useState<AbortController | undefined>()

  useEffect(() => {
    const controller = new AbortController()
    setController(controller)
    return () => controller.abort()
  }, [])

  return useCallback(
    async function poll(
      job: string,
      signal = controller?.signal ?? null
    ): Promise<PublicationOutput> {
      const { result } = await request<{ result: PublicationOutput | null }>(
        `${path}/by_job`,
        { job },
        { signal }
      )
      if (result) return result
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return poll(job, signal)
    },
    [controller?.signal, request]
  )
}

export function buildPublicationKey(
  item: Pick<PublicationOutput, 'gid' | 'cid' | 'language' | 'version'>
) {
  return [
    Xid.fromValue(item.gid).toString(),
    Xid.fromValue(item.cid).toString(),
    item.language,
    item.version,
  ].join(':')
}

export function isSamePublication(
  a: Pick<PublicationOutput, 'gid' | 'cid' | 'language' | 'version'>,
  b: Pick<PublicationOutput, 'gid' | 'cid' | 'language' | 'version'>
) {
  return buildPublicationKey(a) === buildPublicationKey(b)
}

export function usePublicationList(
  _gid: string | null | undefined,
  _status: PublicationStatus.Archived | null | undefined
) {
  const {
    readPublicationList,
    readArchivedPublicationList,
    publishPublication,
    archivePublication,
    restorePublication,
    deletePublication,
  } = usePublicationAPI()

  const getKey = useCallback(
    (_: unknown, prevPage: Page<PublicationOutput> | null) => {
      if (!_gid) return null
      if (prevPage && !prevPage.next_page_token) return null

      const params = {
        gid: _gid,
        page_token: prevPage?.next_page_token,
      }

      return [
        _status === PublicationStatus.Archived
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
        path === '/v1/publication/list_archived'
          ? readArchivedPublicationList(params)
          : readPublicationList(params),
      { revalidateOnMount: false }
    )

  //#region processing state
  const [state, setState] = useState({
    isDeleting: {} as Record<string, boolean>,
    isArchiving: {} as Record<string, boolean>,
    isRestoring: {} as Record<string, boolean>,
    isPublishing: {} as Record<string, boolean>,
  })

  const setDeleting = useCallback(
    (item: PublicationOutput, isDeleting: boolean) => {
      setState((prev) => ({
        ...prev,
        isDeleting: {
          ...prev.isDeleting,
          [buildPublicationKey(item)]: isDeleting,
        },
      }))
    },
    []
  )

  const setArchiving = useCallback(
    (item: PublicationOutput, isArchiving: boolean) => {
      setState((prev) => ({
        ...prev,
        isArchiving: {
          ...prev.isArchiving,
          [buildPublicationKey(item)]: isArchiving,
        },
      }))
    },
    []
  )

  const setRestoring = useCallback(
    (item: PublicationOutput, isRestoring: boolean) => {
      setState((prev) => ({
        ...prev,
        isRestoring: {
          ...prev.isRestoring,
          [buildPublicationKey(item)]: isRestoring,
        },
      }))
    },
    []
  )

  const setPublishing = useCallback(
    (item: PublicationOutput, isPublishing: boolean) => {
      setState((prev) => ({
        ...prev,
        isPublishing: {
          ...prev.isPublishing,
          [buildPublicationKey(item)]: isPublishing,
        },
      }))
    },
    []
  )

  const isDeleting = useCallback(
    (item: PublicationOutput) => {
      return state.isDeleting[buildPublicationKey(item)] ?? false
    },
    [state.isDeleting]
  )

  const isArchiving = useCallback(
    (item: PublicationOutput) => {
      return state.isArchiving[buildPublicationKey(item)] ?? false
    },
    [state.isArchiving]
  )

  const isRestoring = useCallback(
    (item: PublicationOutput) => {
      return state.isRestoring[buildPublicationKey(item)] ?? false
    },
    [state.isRestoring]
  )

  const isPublishing = useCallback(
    (item: PublicationOutput) => {
      return state.isPublishing[buildPublicationKey(item)] ?? false
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
  const publishItem = useCallback(
    async (item: PublicationOutput) => {
      try {
        setPublishing(item, true)
        const { result } = await publishPublication({
          gid: item.gid,
          cid: item.cid,
          language: item.language,
          version: item.version,
          updated_at: item.updated_at,
          status: PublicationStatus.Published,
        })
        mutate((prev) =>
          prev?.map((page): typeof page => ({
            ...page,
            result: page.result.map((item) =>
              isSamePublication(item, result) ? result : item
            ),
          }))
        )
      } finally {
        setPublishing(item, false)
      }
    },
    [mutate, publishPublication, setPublishing]
  )

  const archiveItem = useCallback(
    async (item: PublicationOutput) => {
      try {
        setArchiving(item, true)
        const { result } = await archivePublication({
          gid: item.gid,
          cid: item.cid,
          language: item.language,
          version: item.version,
          updated_at: item.updated_at,
          status: PublicationStatus.Archived,
        })
        mutate((prev) =>
          prev?.map((page): typeof page => ({
            ...page,
            result: page.result.filter(
              (item) => !isSamePublication(item, result)
            ),
          }))
        )
      } finally {
        setArchiving(item, false)
      }
    },
    [archivePublication, mutate, setArchiving]
  )

  const restoreItem = useCallback(
    async (item: PublicationOutput) => {
      try {
        setRestoring(item, true)
        const { result } = await restorePublication({
          gid: item.gid,
          cid: item.cid,
          language: item.language,
          version: item.version,
          updated_at: item.updated_at,
          status: PublicationStatus.Review,
        })
        mutate((prev) =>
          prev?.map((page): typeof page => ({
            ...page,
            result: page.result.filter(
              (item) => !isSamePublication(item, result)
            ),
          }))
        )
      } finally {
        setRestoring(item, false)
      }
    },
    [mutate, restorePublication, setRestoring]
  )

  const deleteItem = useCallback(
    async (item: PublicationOutput) => {
      try {
        setDeleting(item, true)
        await deletePublication(item.gid, item.cid, item.language, item.version)
        mutate((prev) =>
          prev?.map((page): typeof page => ({
            ...page,
            result: page.result.filter(
              (_item) => !isSamePublication(_item, item)
            ),
          }))
        )
      } finally {
        setDeleting(item, false)
      }
    },
    [deletePublication, mutate, setDeleting]
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
    isPublishing,
    publishItem,
    archiveItem,
    restoreItem,
    deleteItem,
  }
}
