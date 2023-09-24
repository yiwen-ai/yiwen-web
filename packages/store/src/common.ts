import { useCallback, useMemo } from 'react'
import { type SWRInfiniteResponse } from 'swr/infinite'
import { type CreationStatus } from './useCreation'
import { type PublicationStatus } from './usePublication'

export interface Pagination {
  page_token?: Uint8Array | null | undefined
  page_size?: number
  status?: number
  fields?: string[]
}

export interface UIDPagination {
  uid?: Uint8Array
  page_token?: Uint8Array | null | undefined
  page_size?: number
  kind?: string
  status?: number
  fields?: string[]
}

export interface GIDPagination {
  gid: Uint8Array
  page_token?: Uint8Array | null | undefined
  page_size?: number
  status?: CreationStatus | PublicationStatus
  fields?: string[]
}

export interface Page<T> {
  next_page_token: Uint8Array | null
  result: readonly T[]
}

export enum RoleLevel {
  OWNER = 2,
  MEMBER = 1,
  GUEST = 0,
}

export enum UserStatus {
  Disabled = -2,
  Suspended = -1,
  Normal = 0,
  Verified = 1,
  Protected = 2,
}

export type ColorScheme = 'light' | 'dark' | 'auto'

export interface UserInfo {
  cn: string
  name: string
  locale: string
  picture: string
  status: UserStatus
  theme?: ColorScheme
}

export interface GroupInfo {
  id: Uint8Array
  cn: string
  name: string
  logo: string
  slogan: string
  status: number
  _role?: RoleLevel
  owner?: UserInfo
  _following?: boolean
}

export interface PostFilePolicy {
  host: string
  dir: string
  access_key: string
  policy: string
  signature: string
  base_url: string
}

export const isSystem = (info: UserInfo | undefined) => info?.cn === 'sys'

export function usePagination<T>({
  getKey,
  data,
  error,
  mutate,
  isValidating,
  isLoading,
  setSize,
}: SWRInfiniteResponse<Page<T>, unknown> & {
  getKey: (_: number, prevPage: Page<T> | null) => readonly unknown[] | null
}) {
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

  return {
    isLoading,
    error,
    items,
    hasMore,
    isLoadingMore: isValidating,
    loadMore,
    refresh,
  } as const
}
