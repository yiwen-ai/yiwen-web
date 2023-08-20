import { type JSONContent } from '@tiptap/core'
import { omitBy } from 'lodash-es'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { concatMap, interval } from 'rxjs'
import useSWR from 'swr'
import useSWRInfinite from 'swr/infinite'
import { Xid } from 'xid-ts'
import { useAuth } from './AuthContext'
import { decode, encode } from './CBOR'
import {
  type GIDPagination,
  type GroupInfo,
  type Page,
  type UserInfo,
} from './common'
import { useFetcher } from './useFetcher'
import { useMyGroupList } from './useGroup'

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
  genre?: string[]
  title?: string
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

const path = '/v1/publication'

export function usePublication(
  _gid: string | null | undefined,
  _cid: string | null | undefined,
  _language: string | null | undefined,
  _version: number | string | null | undefined
) {
  const request = useFetcher()

  const getKey = useCallback(() => {
    if (!_gid || !_cid || !_language || _version == null) return null
    interface Params
      extends Record<keyof QueryPublication, string | number | undefined> {}
    const params: Params = {
      gid: _gid,
      cid: _cid,
      language: _language,
      version: _version,
      fields: undefined,
    }
    return [path, params] as const
  }, [_cid, _gid, _language, _version])

  const {
    data: { result: publication } = {},
    error,
    mutate,
    isValidating: _isValidatingPublication,
    isLoading: _isLoadingPublication,
  } = useSWR(getKey, ([path, params]) =>
    request.get<{ result: PublicationOutput }>(path, params)
  )

  const [controller, setController] = useState<AbortController | undefined>()
  useEffect(() => {
    const controller = new AbortController()
    setController(controller)
    return () => controller.abort()
  }, [])

  const defaultGroupId = useMyGroupList().defaultGroup?.id

  const [translatingLanguage, setTranslatingLanguage] = useState<
    string | undefined
  >()

  const translate = useCallback(
    async (language: string) => {
      try {
        setTranslatingLanguage(language)
        if (!defaultGroupId || !publication) {
          throw new Error('need to fetch publication before translating it')
        }
        const body: CreatePublicationInput = {
          ...publication,
          to_gid: defaultGroupId,
          to_language: language,
        }
        const { job, result } = await request.post<{
          job: string
          result: PublicationOutput | null
        }>(path, body)
        if (result) return result
        return new Promise<PublicationOutput>((resolve, reject) => {
          const subscription = interval(1000)
            .pipe(
              concatMap(async () => {
                const { result } = await request<{
                  result: PublicationOutput | null
                }>(
                  `${path}/by_job`,
                  { job },
                  { signal: controller?.signal ?? null }
                )
                return result
              })
            )
            .subscribe({
              next: (result) => {
                if (result) {
                  subscription.unsubscribe()
                  resolve(result)
                }
              },
              error: (error) => {
                reject(error)
              },
            })
        })
      } finally {
        setTranslatingLanguage(undefined)
      }
    },
    [controller?.signal, defaultGroupId, publication, request]
  )

  return {
    publication,
    error,
    mutate,
    isLoading: _isValidatingPublication || _isLoadingPublication,
    translatingLanguage,
    translate,
  } as const
}

export function useRelatedPublicationList(
  _gid: string | null | undefined,
  _cid: string | null | undefined
) {
  const request = useFetcher()

  const getKey = useCallback(() => {
    if (!_gid || !_cid) return null
    interface Params
      extends Record<keyof QueryPublication, string | number | undefined> {}
    const params: Params = {
      gid: _gid,
      cid: _cid,
      language: undefined,
      version: undefined,
      fields: undefined,
    }
    return [`${path}/publish`, params] as const
  }, [_cid, _gid])

  const {
    data: { result: publicationList } = {},
    error,
    mutate,
    isValidating: _isValidatingPublicationList,
    isLoading: _isLoadingPublicationList,
  } = useSWR(getKey, ([path, params]) =>
    request.get<{ result: PublicationOutput[] }>(path, params)
  )

  return {
    publicationList,
    error,
    mutate,
    isLoading: _isValidatingPublicationList || _isLoadingPublicationList,
  } as const
}

export function useEditPublication(
  _gid: string | null | undefined,
  _cid: string | null | undefined,
  _language: string | null | undefined,
  _version: number | string | null | undefined
) {
  const request = useFetcher()

  //#region fetch group & publication
  const { locale } = useAuth().user ?? {}

  const {
    defaultGroup: { id: defaultGroupId } = {},
    isLoading: _isLoadingGroup,
  } = useMyGroupList()

  const {
    publication,
    mutate,
    isLoading: _isLoadingPublication,
  } = usePublication(_gid, _cid, _language, _version)
  //#endregion

  //#region draft
  interface Draft {
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

  const [draft, setDraft] = useState<Draft>(() => ({
    __isReady: false,
    gid: _gid ? Xid.fromValue(_gid) : undefined,
    cid: _cid ? Xid.fromValue(_cid) : undefined,
    language: locale,
    version: undefined,
    model: DEFAULT_MODEL,
    updated_at: undefined,
    title: '',
    content: undefined,
  }))

  useEffect(() => {
    if (_gid && _cid) {
      if (publication) {
        setDraft((prev) => ({
          ...prev,
          ...publication,
          content: decode(publication.content),
          __isReady: true,
        }))
      }
    } else {
      const gid = _gid ?? defaultGroupId
      if (gid) {
        setDraft((prev) => {
          const prevGid = prev.gid && Xid.fromValue(prev.gid)
          const nextGid = Xid.fromValue(gid)
          if (prevGid?.equals(nextGid) && prev.__isReady) return prev
          return { ...prev, gid: nextGid, __isReady: true }
        })
      }
    }
  }, [_cid, _gid, publication, defaultGroupId])

  const updateDraft = useCallback((draft: Partial<Draft>) => {
    setDraft((prev) => ({ ...prev, ...draft }))
  }, [])
  //#endregion

  //#region processing state
  const isLoading = _isLoadingGroup || _isLoadingPublication || !draft.__isReady

  const [isSaving, setIsSaving] = useState(false)

  // TODO: validate draft.content
  const isDisabled =
    isLoading ||
    isSaving ||
    !draft.gid ||
    !draft.cid ||
    !draft.language ||
    draft.version === undefined ||
    !draft.title.trim() ||
    !draft.content
  //#endregion

  //#region actions
  const create = useCallback(async () => {
    try {
      setIsSaving(true)
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
    } finally {
      setIsSaving(false)
    }
  }, [draft, request])

  const update = useCallback(async () => {
    try {
      setIsSaving(true)
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
      const body: UpdatePublicationContentInput = {
        gid: draft.gid,
        cid: draft.cid,
        language: draft.language,
        version: draft.version,
        updated_at: draft.updated_at,
        content: encode(draft.content),
      }
      const { result: item } = await request.put<{
        result: PublicationOutput
      }>(`${path}/update_content`, body)
      const body2: UpdatePublicationInput = {
        ...draft,
        gid: item.gid,
        cid: item.cid,
        language: item.language,
        version: item.version,
        updated_at: item.updated_at,
        title: draft.title.trim(),
      }
      const { result } = await request.patch<{ result: PublicationOutput }>(
        path,
        omitBy(body2, (val) => val == null || val === '')
      )
      mutate({ result })
      return result
    } finally {
      setIsSaving(false)
    }
  }, [draft, mutate, request])
  //#endregion

  return {
    draft,
    updateDraft,
    isLoading,
    isDisabled,
    isSaving,
    save: _gid && _cid ? update : create,
  } as const
}

export function buildPublicationKey(item: PublicationOutput) {
  return [
    Xid.fromValue(item.gid).toString(),
    Xid.fromValue(item.cid).toString(),
    item.language,
    item.version,
  ].join(':')
}

function isSamePublication(a: PublicationOutput, b: PublicationOutput) {
  return (
    Xid.fromValue(a.gid).equals(Xid.fromValue(b.gid)) &&
    Xid.fromValue(a.cid).equals(Xid.fromValue(b.cid)) &&
    a.language === b.language &&
    a.version === b.version
  )
}

export function usePublicationList({ status, ...query }: GIDPagination) {
  const request = useFetcher()

  const getKey = useCallback(
    (
      index: number,
      previousPageData: Page<PublicationOutput> | null
    ): [string, GIDPagination] | null => {
      if (previousPageData && !previousPageData.next_page_token) return null

      return [
        status === PublicationStatus.Archived
          ? `${path}/list_archived`
          : `${path}/list`,
        {
          ...query,
          page_token: previousPageData?.next_page_token,
        },
      ]
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(query), status]
  )

  const { data, error, mutate, isValidating, isLoading, setSize } =
    useSWRInfinite(
      getKey,
      ([path, body]) => request.post<Page<PublicationOutput>>(path, body),
      {
        revalidateIfStale: true,
        revalidateOnMount: false,
      }
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
    if (!data) return true
    return !!data[data.length - 1]?.next_page_token
  }, [data])

  const loadMore = useCallback(() => {
    if (isValidating || isLoading || !hasMore) return
    if (items.length === 0) mutate()
    else setSize((size) => size + 1)
  }, [hasMore, isLoading, isValidating, items.length, mutate, setSize])

  const refresh = useCallback(() => mutate(), [mutate])
  //#endregion

  //#region actions
  const publishItem = useCallback(
    async (item: PublicationOutput) => {
      try {
        setPublishing(item, true)
        const body: UpdatePublicationStatusInput = {
          gid: item.gid,
          cid: item.cid,
          language: item.language,
          version: item.version,
          updated_at: item.updated_at,
          status: PublicationStatus.Published,
        }
        await request.patch<{
          result: PublicationOutput
        }>(`${path}/publish`, body)
        mutate()
      } finally {
        setPublishing(item, false)
      }
    },
    [request, mutate, setPublishing]
  )

  const archiveItem = useCallback(
    async (item: PublicationOutput) => {
      try {
        setArchiving(item, true)
        const body: UpdatePublicationStatusInput = {
          gid: item.gid,
          cid: item.cid,
          language: item.language,
          version: item.version,
          updated_at: item.updated_at,
          status: PublicationStatus.Archived,
        }
        await request.patch<{
          result: PublicationOutput
        }>(`${path}/archive`, body)
        mutate((prev) =>
          prev?.map((page): typeof page => ({
            ...page,
            result: page.result.filter(
              (_item) => !isSamePublication(_item, item)
            ),
          }))
        )
      } finally {
        setArchiving(item, false)
      }
    },
    [request, mutate, setArchiving]
  )

  const restoreItem = useCallback(
    async (item: PublicationOutput) => {
      try {
        setRestoring(item, true)
        const body: UpdatePublicationStatusInput = {
          gid: item.gid,
          cid: item.cid,
          language: item.language,
          version: item.version,
          updated_at: item.updated_at,
          status: PublicationStatus.Review,
        }
        await request.patch<{
          result: PublicationOutput
        }>(`${path}/redraft`, body)
        mutate((prev) =>
          prev?.map((page): typeof page => ({
            ...page,
            result: page.result.filter(
              (_item) => !isSamePublication(_item, item)
            ),
          }))
        )
      } finally {
        setRestoring(item, false)
      }
    },
    [request, mutate, setRestoring]
  )

  const deleteItem = useCallback(
    async (item: PublicationOutput) => {
      try {
        setDeleting(item, true)
        await request.delete(path, {
          gid: Xid.fromValue(item.gid).toString(),
          cid: Xid.fromValue(item.cid).toString(),
          language: item.language,
          version: item.version,
        })
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
    [request, mutate, setDeleting]
  )
  //#endregion

  return {
    items,
    error,
    hasMore,
    isLoading: isValidating || isLoading,
    isDeleting,
    isArchiving,
    isRestoring,
    isPublishing,
    loadMore,
    refresh,
    publishItem,
    archiveItem,
    restoreItem,
    deleteItem,
  }
}
