import { useCallback, useMemo } from 'react'
import { type SWRInfiniteResponse } from 'swr/infinite'
import { type CreationStatus } from './useCreation'
import { type PublicationStatus } from './usePublication'

export interface QueryPagination {
  page_token?: string
  page_size?: number
  status?: number
  fields?: string
}

export interface UIDPagination {
  uid?: Uint8Array
  page_token?: Uint8Array | null | undefined
  page_size?: number
  kind?: string
  status?: number
  fields?: string[]
}

export interface QueryGIDPagination {
  gid: string
  page_token?: string
  page_size?: number
  status?: CreationStatus | PublicationStatus
  fields?: string
}

export interface QueryIDGIDPagination extends QueryGIDPagination {
  id: string
  language?: string
}

export interface Page<T> {
  next_page_token: Uint8Array | null
  result: readonly T[]
}

export enum RoleLevel {
  OWNER = 2,
  ADMIN = 1,
  MEMBER = 0,
  GUEST = -1,
}

export enum UserStatus {
  Disabled = -2,
  Suspended = -1,
  Normal = 0,
  Verified = 1,
  Protected = 2,
}

export enum ObjectKind {
  Creation = 0,
  Publication = 1,
  Collection = 2,
}

export interface ObjectParams {
  cid: Uint8Array
  gid?: Uint8Array
  parent?: Uint8Array
  language?: string
  version?: number
  kind?: ObjectKind
  title?: string
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

export interface SubscriptionOutput {
  uid: Uint8Array
  gid: Uint8Array
  cid: Uint8Array
  txn: Uint8Array
  expire_at: number
  updated_at: number
}

export interface RFPInfo {
  id: Uint8Array
  price: number
}

// Request for Payment
export interface RFP {
  creation?: RFPInfo
  collection?: RFPInfo
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

export function isInWechat() {
  return window.navigator.userAgent.toLowerCase().includes('micromessenger/')
}

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
    if (!data || error) return false
    return !!data[data.length - 1]?.next_page_token
  }, [data, error])

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

export const BytesToBase64Url = (bytes: Uint8Array) =>
  btoa(String.fromCodePoint(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
