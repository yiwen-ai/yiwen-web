import { type CreationStatus } from './useCreation'
import { type PublicationStatus } from './usePublication'

export interface GIDPagination {
  gid: Uint8Array
  page_token?: Uint8Array
  page_size?: number
  status?: CreationStatus | PublicationStatus
  fields?: string[]
}

export interface Page<T> {
  next_page_token: Uint8Array | null
  result: readonly T[]
}
