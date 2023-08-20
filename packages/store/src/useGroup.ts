import { useMemo } from 'react'
import useSWR from 'swr'
import { RoleLevel, type UserInfo } from './common'
import { useFetcher } from './useFetcher'

export interface Group {
  id: Uint8Array
  cn: string
  name: string
  logo?: string
  website?: string
  status?: number
  kind?: number
  created_at?: number
  updated_at?: number
  email?: string
  legal_name?: string
  keywords?: string[]
  slogan?: string
  address?: string
  _role?: RoleLevel
  _priority?: number
  uid?: Uint8Array
  owner?: UserInfo
}

export function useMyGroupList() {
  const fetcher = useFetcher()
  const { data, error, isValidating, isLoading } = useSWR<{ result: Group[] }>(
    '/v1/group/list_my',
    fetcher.post
  )

  const defaultGroup = useMemo(
    () => data?.result.find((group) => group._role === RoleLevel.OWNER),
    [data?.result]
  )

  return {
    defaultGroup,
    groupList: data?.result,
    error,
    isLoading: isValidating || isLoading,
  }
}
