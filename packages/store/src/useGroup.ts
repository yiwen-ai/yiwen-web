import useSWR from 'swr'
import { useFetcher } from './useFetcher'
import { type User } from './useUser'

export interface Group {
  id: Uint8Array
  cn: string
  name: string
  logo: string
  website: string
  status: number
  kind: number
  created_at: number
  updated_at: number
  email?: string
  legal_name?: string
  keywords?: string[]
  slogan?: string
  address?: string
  description?: Uint8Array
  _role: number
  _priority: number
  uid?: Uint8Array
  owner?: User
}

export function useMyGroupList() {
  const fetcher = useFetcher()
  const { data, isLoading } = useSWR<{ result: Group[] }>(
    fetcher && '/v1/group/list_my',
    fetcher?.post ?? null
  )

  return {
    groupList: data?.result,
    isLoading,
  }
}

export function useMyDefaultGroup() {
  const { groupList } = useMyGroupList()
  return groupList?.[0]
}
