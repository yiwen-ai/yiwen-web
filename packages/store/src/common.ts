import { type CreationStatus } from './useCreation'
import { type PublicationStatus } from './usePublication'

export interface Pagination {
  page_token?: Uint8Array
  page_size?: number
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
}
