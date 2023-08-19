import { type JSONContent } from '@tiptap/core'
import { omitBy } from 'lodash-es'
import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { DEFAULT_MODEL, type CreatePublicationInput } from './usePublication'

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

const path = '/v1/creation'

export function useCreation(
  _gid: string | null | undefined,
  _cid: string | null | undefined
) {
  const request = useFetcher()

  const getKey = useCallback(() => {
    if (!_gid || !_cid) return null
    interface Params extends Record<keyof QueryCreation, string | undefined> {}
    const params: Params = { gid: _gid, id: _cid, fields: undefined }
    return [path, params] as const
  }, [_cid, _gid])

  const {
    data: { result: creation } = {},
    error,
    mutate,
    isValidating: _isValidatingCreation,
    isLoading: _isLoadingCreation,
  } = useSWR(getKey, ([path, params]) =>
    request.get<{ result: CreationOutput }>(path, params)
  )

  return {
    creation,
    error,
    mutate,
    isLoading: _isValidatingCreation || _isLoadingCreation,
  } as const
}

export function useEditCreation(
  _gid: string | null | undefined,
  _cid: string | null | undefined
) {
  const request = useFetcher()

  //#region fetch group & creation
  const { locale } = useAuth().user ?? {}

  const {
    defaultGroup: { id: defaultGroupId } = {},
    isLoading: _isLoadingGroup,
  } = useMyGroupList()

  const {
    creation,
    mutate,
    isLoading: _isLoadingCreation,
  } = useCreation(_gid, _cid)
  //#endregion

  //#region draft
  interface Draft {
    __isReady: boolean
    gid: Uint8Array | undefined
    id: Uint8Array | undefined
    language: string | undefined
    updated_at: number | undefined
    title: string
    content: JSONContent | undefined
  }

  const [draft, setDraft] = useState<Draft>(() => ({
    __isReady: false,
    gid: _gid ? Xid.fromValue(_gid) : undefined,
    id: _cid ? Xid.fromValue(_cid) : undefined,
    language: locale,
    updated_at: undefined,
    title: '',
    content: undefined,
  }))

  useEffect(() => {
    if (_gid && _cid) {
      if (creation) {
        setDraft((prev) => ({
          ...prev,
          ...creation,
          content: decode(creation.content),
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
  }, [_cid, _gid, creation, defaultGroupId])

  const updateDraft = useCallback((draft: Partial<Draft>) => {
    setDraft((prev) => ({ ...prev, ...draft }))
  }, [])
  //#endregion

  //#region processing state
  const isLoading = _isLoadingGroup || _isLoadingCreation || !draft.__isReady

  const [isSaving, setIsSaving] = useState(false)

  // TODO: validate draft.content
  const isDisabled =
    isLoading ||
    isSaving ||
    !draft.gid ||
    !draft.language ||
    !draft.title.trim() ||
    !draft.content
  //#endregion

  //#region actions
  const create = useCallback(async () => {
    try {
      setIsSaving(true)
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
    } finally {
      setIsSaving(false)
    }
  }, [draft, request])

  const update = useCallback(async () => {
    try {
      setIsSaving(true)
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
      const body: UpdateCreationContentInput = {
        gid: draft.gid,
        id: draft.id,
        language: draft.language,
        updated_at: draft.updated_at,
        content: encode(draft.content),
      }
      const { result: item } = await request.put<{
        result: CreationOutput
      }>(`${path}/update_content`, body)
      const body2: UpdateCreationInput = {
        ...draft,
        gid: item.gid,
        id: item.id,
        updated_at: item.updated_at,
        title: draft.title.trim(),
      }
      const { result } = await request.patch<{ result: CreationOutput }>(
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

export function useCreationList({ status, ...query }: GIDPagination) {
  const request = useFetcher()

  const getKey = useCallback(
    (
      index: number,
      previousPageData: Page<CreationOutput> | null
    ): [string, GIDPagination] | null => {
      if (previousPageData && !previousPageData.next_page_token) return null

      return [
        status === CreationStatus.Archived
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
      ([path, body]) => request.post<Page<CreationOutput>>(path, body),
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
  const releaseItem = useCallback(
    async (item: CreationOutput) => {
      try {
        setReleasing(item, true)
        const body: CreatePublicationInput = {
          gid: item.gid,
          cid: item.id,
          language: item.language,
          version: item.version,
          model: DEFAULT_MODEL,
        }
        await request.post<{
          result: CreationOutput
        }>(`${path}/release`, body)
        mutate()
      } finally {
        setReleasing(item, false)
      }
    },
    [request, mutate, setReleasing]
  )

  const archiveItem = useCallback(
    async (item: CreationOutput) => {
      try {
        setArchiving(item, true)
        const body: UpdateCreationStatusInput = {
          gid: item.gid,
          id: item.id,
          updated_at: item.updated_at,
          status: CreationStatus.Archived,
        }
        await request.patch<{
          result: CreationOutput
        }>(`${path}/archive`, body)
        mutate((prev) =>
          prev?.map((page): typeof page => ({
            ...page,
            result: page.result.filter((_item) => !isSameCreation(_item, item)),
          }))
        )
      } finally {
        setArchiving(item, false)
      }
    },
    [request, mutate, setArchiving]
  )

  const restoreItem = useCallback(
    async (item: CreationOutput) => {
      try {
        setRestoring(item, true)
        const body: UpdateCreationStatusInput = {
          gid: item.gid,
          id: item.id,
          updated_at: item.updated_at,
          status: CreationStatus.Draft,
        }
        await request.patch<{
          result: CreationOutput
        }>(`${path}/redraft`, body)
        mutate((prev) =>
          prev?.map((page): typeof page => ({
            ...page,
            result: page.result.filter((_item) => !isSameCreation(_item, item)),
          }))
        )
      } finally {
        setRestoring(item, false)
      }
    },
    [request, mutate, setRestoring]
  )

  const deleteItem = useCallback(
    async (item: CreationOutput) => {
      try {
        setDeleting(item, true)
        await request.delete(path, {
          gid: Xid.fromValue(item.gid).toString(),
          id: Xid.fromValue(item.id).toString(),
        })
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
    isReleasing,
    loadMore,
    refresh,
    releaseItem,
    archiveItem,
    restoreItem,
    deleteItem,
  }
}
