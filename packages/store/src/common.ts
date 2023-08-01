export interface GIDPagination {
  gid: Uint8Array
  page_token?: Uint8Array
  page_size?: number
  status?: number
  fields?: string[]
}
