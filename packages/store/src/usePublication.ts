import { type JSONContent } from '@tiptap/core'
import { useLoading } from '@yiwen-ai/util'
import { isEqual, omitBy } from 'lodash-es'
import { useCallback, useEffect, useMemo, useState } from 'react'
import useSWR, { useSWRConfig, type SWRConfiguration } from 'swr'
import useSWRInfinite, { unstable_serialize } from 'swr/infinite'
import useSWRSubscription from 'swr/subscription'
import { Xid } from 'xid-ts'
import { useAuth } from './AuthContext'
import {
  BytesToBase64Url,
  usePagination,
  type GroupInfo,
  type Page,
  type PostFilePolicy,
  type QueryGIDPagination,
  type QueryPagination,
  type RFP,
  type SubscriptionOutput,
  type UserInfo,
} from './common'
import { useFetcher } from './useFetcher'

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
  subscription?: SubscriptionOutput
  rfp?: RFP
}

export interface QueryPublication {
  gid: Uint8Array
  cid: Uint8Array
  language: string
  version: number
  fields: string
}

export interface QueryPublicationWithParent extends QueryPublication {
  parent?: Uint8Array
  subtoken?: string
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

export interface EstimateOutput {
  balance: number
  tokens: number
  models: Record<GPT_MODEL, ModelCost>
}

export enum GPT_MODEL {
  GPT3_5 = 'gpt-3.5',
  GPT4 = 'gpt-4',
}

export const DEFAULT_MODEL = GPT_MODEL.GPT3_5

export interface ModelCost {
  id: GPT_MODEL
  name: string
  price: number
  cost: number
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
  title?: string
  cover?: string
  keywords?: string[]
  summary?: string
}

export interface PublicationDraft {
  title: string
  content?: JSONContent | undefined
  cover?: string
  keywords?: string[]
  summary?: string
  __cover_name?: string
}

export enum PublicationJobStatus {
  Error = -1,
  Processing = 0,
  Done = 1,
}

export interface PublicationJob {
  job: string
  status: PublicationJobStatus
  action: string
  progress: number // 0 - 100
  tokens: number
  publication?: PublicationOutput
  error?: string
}

const path = '/v1/publication'

export function initialPublicationDraft(): PublicationDraft {
  return {
    title: '',
  }
}

export function diffPublicationDraft(
  src: PublicationOutput,
  draft: PublicationDraft
): UpdatePublicationInput | null {
  if (!src || !draft) return null

  const rt: UpdatePublicationInput = {
    gid: src.gid,
    cid: src.cid,
    language: src.language,
    version: src.version,
    updated_at: src.updated_at,
  }

  if (draft.title && src.title != draft.title) {
    rt.title = draft.title
  }
  if (draft.cover && src.cover != draft.cover) {
    rt.cover = draft.cover
  }
  if (draft.summary && src.summary != draft.summary) {
    rt.summary = draft.summary
  }
  if (draft.keywords && !isEqual(src.keywords, draft.keywords)) {
    rt.keywords = draft.keywords
  }

  return Object.keys(rt).length > 5 ? rt : null
}

export function usePublicationAPI(baseURL?: string) {
  const request = useFetcher(baseURL)

  const readPublication = useCallback(
    (
      params: Record<
        keyof QueryPublicationWithParent,
        string | number | undefined
      >,
      signal?: AbortSignal
    ) => {
      return request.get<{ result: PublicationOutput }>(path, params, signal)
    },
    [request]
  )

  const readPublicationList = useCallback(
    (params: Record<keyof QueryGIDPagination, string | number | undefined>) => {
      return request.get<Page<PublicationOutput>>(
        `${path}/list`,
        Object.assign(params, { page_size: 20 })
      )
    },
    [request]
  )

  const readArchivedPublicationList = useCallback(
    (params: Record<keyof QueryGIDPagination, string | number | undefined>) => {
      return request.get<Page<PublicationOutput>>(
        `${path}/list_archived`,
        Object.assign(params, { page_size: 20 })
      )
    },
    [request]
  )

  const readTranslatedPublicationList = useCallback(
    async (params: Record<keyof QueryPublication, string | number | null>) => {
      const res = await request.get<{ result: PublicationOutput[] }>(
        `${path}/publish`,
        params
      )
      res.result.sort((a, b) => b.version - a.version)
      return res
    },
    [request]
  )

  const readProcessingPublicationList = useCallback(() => {
    return request.get<{ result: PublicationJob[] }>(`${path}/list_job`)
  }, [request])

  const readRecommendedPublicationList = useCallback(() => {
    return request.get<{ result: PublicationOutput[] }>(
      `${path}/recommendations`
    )
  }, [request])

  const readFollowedPublicationList = useCallback(
    (params: Record<keyof QueryPagination, string | number | undefined>) => {
      return request.get<Page<PublicationOutput>>(
        `${path}/list_by_following`,
        params
      )
    },
    [request]
  )

  const readPublicationUploadPolicy = useCallback(
    (params: Record<keyof QueryPublication, string | undefined>) => {
      return request.get<{ result: PostFilePolicy }>(`${path}/upload`, params)
    },
    [request]
  )

  const estimatePublication = useCallback(
    (body: CreatePublicationInput) => {
      return request.post<{ result: EstimateOutput }>(`${path}/estimate`, body)
    },
    [request]
  )

  const translatePublication = useCallback(
    (body: CreatePublicationInput) => {
      return request.post<{ job: string; result: PublicationOutput | null }>(
        path,
        body
      )
    },
    [request]
  )

  const createPublication = useCallback(
    async (input: CreatePublicationInput) => {
      const { result } = await request.post<{ result: PublicationOutput }>(
        path,
        omitBy(input, (val) => val == null || val === '')
      )
      return result
    },
    [request]
  )

  const updatePublication = useCallback(
    async (input: UpdatePublicationInput) => {
      const { result } = await request.patch<{ result: PublicationOutput }>(
        path,
        omitBy(input, (val) => val == null || val === '')
      )
      return result
    },
    [request]
  )

  const updatePublicationContent = useCallback(
    async (input: UpdatePublicationContentInput) => {
      const { result } = await request.put<{
        result: PublicationOutput
      }>(`${path}/update_content`, input)
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
    readProcessingPublicationList,
    readRecommendedPublicationList,
    readFollowedPublicationList,
    readPublicationUploadPolicy,
    estimatePublication,
    translatePublication,
    createPublication,
    updatePublication,
    updatePublicationContent,
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
  _version: number | string | null | undefined,
  _parent?: string | undefined,
  _subtoken?: string | undefined,
  config?: {
    baseURL?: string
  }
) {
  const { mutate: mutateGobal } = useSWRConfig()
  const { readPublication } = usePublicationAPI(config?.baseURL)

  const getKey = useCallback(() => {
    if (!_cid) return null
    const params: Record<keyof QueryPublicationWithParent, string | undefined> =
      {
        gid: _gid || undefined,
        cid: _cid,
        language: _language || undefined,
        version: _version != null ? String(_version) : undefined,
        fields: undefined,
        parent: undefined,
        subtoken: undefined,
      }
    return [path, params] as const
  }, [_cid, _gid, _language, _version])

  const {
    data: { result: publication } = {},
    error,
    mutate,
    isValidating,
    isLoading,
  } = useSWR(
    getKey,
    ([_, params]) =>
      readPublication({ ...params, parent: _parent, subtoken: _subtoken }),
    {} as SWRConfiguration
  )

  const getListKey = useCallback(
    (_: unknown, prevPage: Page<PublicationOutput> | null) => {
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
    const result = getKey() && (await mutate())?.result
    if (result) {
      mutateGobal(
        unstable_serialize(getListKey),
        (prev: Page<PublicationOutput>[] | undefined) =>
          prev?.map((page: Page<PublicationOutput>): typeof page => ({
            ...page,
            result: page.result.map((item) =>
              isSamePublication(item, result) ? { ...item, ...result } : item
            ),
          })),
        {
          revalidate: false,
          populateCache: true,
        }
      )
    }
    return result
  }, [getKey, getListKey, mutate, mutateGobal])

  return {
    isLoading,
    isValidating,
    error,
    publication,
    refresh,
  } as const
}

export function usePublicationUploadPolicy(
  _gid: string | null | undefined,
  _cid: string | null | undefined,
  _language: string | null | undefined,
  _version: number | string | null | undefined
) {
  const { readPublicationUploadPolicy } = usePublicationAPI()

  const getKey = useCallback(() => {
    if (!_gid || !_cid || !_language || _version == null) return null
    const params: Record<keyof QueryPublication, string | undefined> = {
      gid: _gid,
      cid: _cid,
      language: _language,
      version: String(_version),
      fields: undefined,
    }
    return [`${path}/upload`, params] as const
  }, [_cid, _gid, _language, _version])

  const { data, error, mutate, isValidating, isLoading } = useSWR(
    getKey,
    ([, params]) => readPublicationUploadPolicy(params),
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

export function useTranslatedPublicationList(
  _gid: string | null | undefined,
  _cid: string | null | undefined,
  _language: string | null | undefined,
  _version: number | null | undefined
) {
  const { isAuthorized } = useAuth()
  const {
    readTranslatedPublicationList,
    readProcessingPublicationList,
    estimatePublication,
    translatePublication,
  } = usePublicationAPI()
  const readPublicationByJob = useReadPublicationByJob()

  const getTranslatedListKey = useCallback(() => {
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

  const {
    data: translatedList,
    error: translatedListError,
    mutate: mutateTranslatedList,
    isValidating: isValidatingTranslatedList,
    isLoading: isLoadingTranslatedList,
  } = useSWR(
    getTranslatedListKey,
    ([path, params]) => readTranslatedPublicationList(params),
    {}
  )

  const refreshTranslatedList = useCallback(
    async () => getTranslatedListKey() && (await mutateTranslatedList()),
    [getTranslatedListKey, mutateTranslatedList]
  )

  const getProcessingListKey = useCallback(() => {
    if (!isAuthorized) return null
    return [`${path}/list_job`, null] as const
  }, [isAuthorized])

  const {
    data: processingList,
    error: processingListError,
    mutate: mutateProcessingList,
    isValidating: isValidatingProcessingList,
    isLoading: isLoadingProcessingList,
  } = useSWR(
    getProcessingListKey,
    ([path]) => readProcessingPublicationList(),
    {}
  )

  const refreshProcessingList = useCallback(
    async () => getProcessingListKey() && (await mutateProcessingList()),
    [getProcessingListKey, mutateProcessingList]
  )

  //#region estimate
  const [setEstimating, isEstimating] = useLoading(
    (language: string) => language
  )

  const estimate = useCallback(
    async (language: string | undefined) => {
      const original = translatedList?.result?.find(
        (item) => item.language == item.from_language
      )
      const original_language = original?.language || _language
      const original_version = original?.version || _version

      if (
        !_gid ||
        !_cid ||
        !original_language ||
        !original_version ||
        !language
      ) {
        throw new Error(
          'group id, creation id, language, version, target group id and target language are required to translate a publication'
        )
      }
      try {
        setEstimating(language, true)
        const { result } = await estimatePublication({
          gid: Xid.fromValue(_gid),
          cid: Xid.fromValue(_cid),
          language: original_language,
          version: original_version,
          model: DEFAULT_MODEL,
          to_language: language,
        })
        return result
      } finally {
        setEstimating(language, false)
      }
    },
    [
      _cid,
      _gid,
      _language,
      _version,
      translatedList,
      estimatePublication,
      setEstimating,
    ]
  )
  //#endregion

  //#region translate
  const [setTranslating, isTranslating] = useLoading(
    (language: string) => language
  )

  const translate = useCallback(
    async (
      gid: Uint8Array | undefined,
      language: string | undefined,
      model: GPT_MODEL,
      signal: AbortSignal
    ) => {
      const original = translatedList?.result?.find(
        (item) => item.language == item.from_language
      )
      const original_language = original?.language || _language
      const original_version = original?.version || _version
      if (
        !_gid ||
        !_cid ||
        !original_language ||
        !original_version ||
        !gid ||
        !language
      ) {
        throw new Error(
          'group id, creation id, language, version, target group id and target language are required to translate a publication'
        )
      }
      try {
        setTranslating(language, true)
        const resp = await translatePublication({
          gid: Xid.fromValue(_gid),
          cid: Xid.fromValue(_cid),
          language: original_language,
          version: original_version,
          model,
          to_gid: gid,
          to_language: language,
        })
        let { result } = resp
        if (!result) {
          mutateProcessingList()
          result = await readPublicationByJob(resp.job, signal)
        }
        mutateProcessingList()
        mutateTranslatedList()
        return result
      } finally {
        setTranslating(language, false)
      }
    },
    [
      _cid,
      _gid,
      _language,
      _version,
      translatedList,
      mutateProcessingList,
      mutateTranslatedList,
      readPublicationByJob,
      setTranslating,
      translatePublication,
    ]
  )
  //#endregion

  return {
    isLoadingTranslatedList:
      isValidatingTranslatedList || isLoadingTranslatedList,
    isLoadingProcessingList:
      isValidatingProcessingList || isLoadingProcessingList,
    translatedListError,
    processingListError,
    translatedList: translatedList?.result,
    processingList: processingList?.result,
    refreshTranslatedList,
    refreshProcessingList,
    isEstimating,
    isTranslating,
    estimate,
    translate,
  } as const
}

export function usePublicationByJob(job: string | null | undefined) {
  const request = useFetcher()

  const getKey = useCallback(() => {
    if (!job) return null
    const params = {
      job,
    }
    return [path, params] as const
  }, [job])

  const [controller, setController] = useState<AbortController | undefined>()

  useEffect(() => {
    const controller = new AbortController()
    setController(controller)
    return () => controller.abort()
  }, [])

  const fetchData = useCallback(
    async (job: string) => {
      return await request<{
        job?: string
        progress?: number
        result: PublicationOutput | null
      }>(`${path}/by_job`, { job }, { signal: controller?.signal || null })
    },
    [controller?.signal, request]
  )

  const { data, error } = useSWRSubscription(
    getKey,
    ([_, params], { next }) => {
      ;(async () => {
        let i = 100
        while (--i > 0) {
          const result = await fetchData(params.job)
          if (result) {
            next(undefined, result)
            if (result.result) return
          }
          await new Promise((resolve) => setTimeout(resolve, 3000))
        }
        throw new Error('timeout')
      })().catch((err) => next(err))
      return () => controller?.abort()
    }
  )

  return {
    error,
    progress: data?.progress,
    publication: data?.result,
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
      const { result } = await request<{
        job?: string
        progress?: number
        result: PublicationOutput | null
      }>(`${path}/by_job`, { job }, { signal })
      if (result) return result
      await new Promise((resolve) => setTimeout(resolve, 2000))
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
      { revalidateFirstPage: false } // trigger too many requests when loading more if true
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
        mutate(
          (prev) =>
            prev?.map((page): typeof page => ({
              ...page,
              result: page.result.map((item) =>
                isSamePublication(item, result) ? { ...item, ...result } : item
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
        mutate(
          (prev) =>
            prev?.map((page): typeof page => ({
              ...page,
              result: page.result.filter(
                (item) => !isSamePublication(item, result)
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

        _status === PublicationStatus.Archived
          ? mutate(
              (prev) =>
                prev?.map((page): typeof page => ({
                  ...page,
                  result: page.result.filter(
                    (item) => !isSamePublication(item, result)
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
                    isSamePublication(item, result)
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
        setRestoring(item, false)
      }
    },
    [_status, mutate, restorePublication, setRestoring]
  )

  const deleteItem = useCallback(
    async (item: PublicationOutput) => {
      try {
        setDeleting(item, true)
        await deletePublication(item.gid, item.cid, item.language, item.version)
        mutate(
          (prev) =>
            prev?.map((page): typeof page => ({
              ...page,
              result: page.result.filter(
                (_item) => !isSamePublication(_item, item)
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
    [deletePublication, mutate, setDeleting]
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

export function useFollowedPublicationList() {
  const { isAuthorized } = useAuth()
  const { readFollowedPublicationList } = usePublicationAPI()

  const getKey = useCallback(
    (_: unknown, prevPage: Page<PublicationOutput> | null) => {
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
      return [`${path}/list_by_following`, params] as const
    },
    [isAuthorized]
  )

  const response = useSWRInfinite(
    getKey,
    ([, body]) => readFollowedPublicationList(body),
    { revalidateFirstPage: false }
  )

  return usePagination({
    getKey,
    ...response,
  })
}

export function useRecommendedPublicationList() {
  const { readRecommendedPublicationList } = usePublicationAPI()

  const getKey = useCallback(() => {
    return [`${path}/recommendations`] as const
  }, [])

  const { data, error, mutate, isValidating, isLoading } = useSWR(
    getKey,
    () => readRecommendedPublicationList(),
    {}
  )

  const refresh = useCallback(
    async () => getKey() && (await mutate()),
    [getKey, mutate]
  )

  return {
    isLoading: isValidating || isLoading,
    error,
    publicationList: data?.result,
    refresh,
  } as const
}
