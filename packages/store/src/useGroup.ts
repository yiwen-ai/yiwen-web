import { useCallback, useMemo } from 'react'
import useSWR, { type SWRConfiguration } from 'swr'
import { RoleLevel, type GroupInfo, type UserInfo } from './common'
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

export interface GroupStatisticOutput {
  publications: number
  members: number
}

export interface QueryIdCn {
  id?: Uint8Array
  cn?: string
  fields?: string
}

const path = '/v1/group'

export function useGroupAPI() {
  const request = useFetcher()

  const readGroupInfo = useCallback(
    (params: Record<keyof QueryIdCn, string | number | undefined>) => {
      return request.get<{ result: GroupInfo }>(`${path}/info`, params)
    },
    [request]
  )

  const readGroupStatistic = useCallback(
    (params: Record<keyof QueryIdCn, string | number | undefined>) => {
      return request.get<{ result: GroupStatisticOutput }>(
        `${path}/statistic`,
        params
      )
    },
    [request]
  )

  const readMyGroupList = useCallback(() => {
    return request.post<{ result: Group[] }>(`${path}/list_my`)
  }, [request])

  return {
    readGroupInfo,
    readGroupStatistic,
    readMyGroupList,
  } as const
}

export function useGroup(_gid: string | null | undefined) {
  const { readGroupInfo, readGroupStatistic } = useGroupAPI()

  const getInfoKey = useCallback(() => {
    if (!_gid) return null
    const params: Record<keyof QueryIdCn, string | number | undefined> = {
      id: _gid,
      cn: undefined,
      fields: undefined,
    }
    return [`${path}/info`, params] as const
  }, [_gid])

  const getStatisticKey = useCallback(() => {
    if (!_gid) return null
    const params: Record<keyof QueryIdCn, string | number | undefined> = {
      id: _gid,
      cn: undefined,
      fields: undefined,
    }
    return [`${path}/statistic`, params] as const
  }, [_gid])

  const {
    data: groupInfo,
    error: groupInfoError,
    mutate: mutateGroupInfo,
    isValidating: isValidatingGroupInfo,
    isLoading: isLoadingGroupInfo,
  } = useSWR(getInfoKey, ([_, params]) => readGroupInfo(params), {
    revalidateOnMount: false,
  } as SWRConfiguration)

  const {
    data: groupStatistic,
    error: groupStatisticError,
    mutate: mutateGroupStatistic,
    isValidating: isValidatingGroupStatistic,
    isLoading: isLoadingGroupStatistic,
  } = useSWR(getStatisticKey, ([_, params]) => readGroupStatistic(params), {
    revalidateOnMount: false,
  } as SWRConfiguration)

  const refreshGroupInfo = useCallback(
    async () => getInfoKey() && (await mutateGroupInfo()),
    [getInfoKey, mutateGroupInfo]
  )

  const refreshGroupStatistic = useCallback(
    async () => getStatisticKey() && (await mutateGroupStatistic()),
    [getStatisticKey, mutateGroupStatistic]
  )

  return {
    isLoading: isLoadingGroupInfo || isLoadingGroupStatistic,
    isValidating: isValidatingGroupInfo || isValidatingGroupStatistic,
    error: groupInfoError || groupStatisticError,
    groupInfo: groupInfo?.result,
    groupStatistic: groupStatistic?.result,
    refreshGroupInfo,
    refreshGroupStatistic,
  } as const
}

export function useMyGroupList() {
  const { readMyGroupList } = useGroupAPI()

  const getKey = useCallback(() => {
    return [`${path}/list_my`] as const
  }, [])

  const { data, error, mutate, isValidating, isLoading } = useSWR(
    getKey,
    ([_]) => readMyGroupList(),
    { revalidateOnMount: false } as SWRConfiguration
  )

  const defaultGroup = useMemo(
    () => data?.result.find((group) => group._role === RoleLevel.OWNER),
    [data?.result]
  )

  const refresh = useCallback(
    async () => getKey() && (await mutate()),
    [getKey, mutate]
  )

  const refreshDefaultGroup = useCallback(async () => {
    return (await refresh())?.result.find(
      (group) => group._role === RoleLevel.OWNER
    )
  }, [refresh])

  return {
    isLoading: isValidating || isLoading,
    error,
    groupList: data?.result,
    defaultGroup,
    refresh,
    refreshDefaultGroup,
  }
}
