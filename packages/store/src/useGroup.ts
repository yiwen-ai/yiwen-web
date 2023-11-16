import { omitBy } from 'lodash-es'
import { useCallback, useMemo, useState } from 'react'
import useSWR from 'swr'
import useSWRInfinite from 'swr/infinite'
import { Xid } from 'xid-ts'
import { useAuth } from './AuthContext'
import {
  RoleLevel,
  usePagination,
  type GroupInfo,
  type Page,
  type Pagination,
  type PostFilePolicy,
  type UserInfo,
} from './common'
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

export interface GroupDraft {
  name: string
  logo: string
  slogan?: string
  __logo_name?: string
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

export interface UpdateGroupInput {
  id: Uint8Array
  name?: string
  logo?: string
  slogan?: string
  website?: string
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

  const readFollowedGroupList = useCallback(
    (body: Pagination) => {
      return request.post<Page<Group>>(`${path}/list_following`, body)
    },
    [request]
  )

  const followGroup = useCallback(
    (body: QueryIdCn) => {
      return request.patch<{ result: boolean }>(`${path}/follow`, body)
    },
    [request]
  )

  const unfollowGroup = useCallback(
    (body: QueryIdCn) => {
      return request.patch<{ result: boolean }>(`${path}/unfollow`, body)
    },
    [request]
  )

  const updateGroupInfo = useCallback(
    async (body: UpdateGroupInput) => {
      const { result } = await request.patch<{ result: Group }>(
        path,
        omitBy(body, (val) => val == null)
      )
      return result
    },
    [request]
  )

  const readGroupLogoUploadPolicy = useCallback(
    async (params: Record<keyof QueryIdCn, string | undefined>) => {
      return request.get<{ result: PostFilePolicy }>(
        `${path}/upload_logo`,
        params
      )
    },
    [request]
  )

  return {
    readGroupInfo,
    readGroupStatistic,
    readMyGroupList,
    readFollowedGroupList,
    followGroup,
    unfollowGroup,
    updateGroupInfo,
    readGroupLogoUploadPolicy,
  } as const
}

export function useGroup(_gid: string | null | undefined) {
  const { readGroupInfo, readGroupStatistic, followGroup, unfollowGroup } =
    useGroupAPI()

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
  } = useSWR(getInfoKey, ([_, params]) => readGroupInfo(params), {})

  const {
    data: groupStatistic,
    error: groupStatisticError,
    mutate: mutateGroupStatistic,
    isValidating: isValidatingGroupStatistic,
    isLoading: isLoadingGroupStatistic,
  } = useSWR(getStatisticKey, ([_, params]) => readGroupStatistic(params), {})

  const refreshGroupInfo = useCallback(
    async () => getInfoKey() && (await mutateGroupInfo()),
    [getInfoKey, mutateGroupInfo]
  )

  const refreshGroupStatistic = useCallback(
    async () => getStatisticKey() && (await mutateGroupStatistic()),
    [getStatisticKey, mutateGroupStatistic]
  )

  const _role = groupInfo?.result._role
  const hasGroupReadPermission =
    _role === RoleLevel.GUEST ||
    _role === RoleLevel.MEMBER ||
    _role === RoleLevel.ADMIN ||
    _role === RoleLevel.OWNER
  const hasGroupAdminPermission =
    _role === RoleLevel.ADMIN || _role === RoleLevel.OWNER
  const hasGroupMemberPermission =
    _role === RoleLevel.MEMBER ||
    _role === RoleLevel.ADMIN ||
    _role === RoleLevel.OWNER

  const isFollowed = !!groupInfo?.result._following
  const [isFollowing, setIsFollowing] = useState(false)
  const [isUnfollowing, setIsUnfollowing] = useState(false)

  const follow = useCallback(async () => {
    if (!_gid) throw new Error('group id is required')
    try {
      setIsFollowing(true)
      const gid = Xid.fromValue(_gid)
      await followGroup({ id: gid })
      mutateGroupInfo()
    } finally {
      setIsFollowing(false)
    }
  }, [_gid, followGroup, mutateGroupInfo])

  const unfollow = useCallback(async () => {
    if (!_gid) throw new Error('group id is required')
    try {
      setIsUnfollowing(true)
      const gid = Xid.fromValue(_gid)
      await unfollowGroup({ id: gid })
      mutateGroupInfo()
    } finally {
      setIsUnfollowing(false)
    }
  }, [_gid, mutateGroupInfo, unfollowGroup])

  return {
    isLoading: isLoadingGroupInfo || isLoadingGroupStatistic,
    isValidating: isValidatingGroupInfo || isValidatingGroupStatistic,
    error: groupInfoError || groupStatisticError,
    groupInfo: groupInfo?.result,
    groupStatistic: groupStatistic?.result,
    hasGroupReadPermission,
    hasGroupAdminPermission,
    hasGroupMemberPermission,
    refreshGroupInfo,
    refreshGroupStatistic,
    isFollowed,
    isFollowing,
    isUnfollowing,
    follow,
    unfollow,
  } as const
}

export function useMyGroupList() {
  const { isAuthorized } = useAuth()
  const { readMyGroupList } = useGroupAPI()

  const getKey = useCallback(() => {
    if (!isAuthorized) return null
    return [`${path}/list_my`] as const
  }, [isAuthorized])

  const { data, error, mutate, isValidating, isLoading } = useSWR(
    getKey,
    ([_]) => readMyGroupList(),
    {}
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

export function useFollowedGroupList() {
  const { isAuthorized } = useAuth()
  const { readFollowedGroupList } = useGroupAPI()

  const getKey = useCallback(
    (_: unknown, prevPage: Page<Group> | null) => {
      if (!isAuthorized) return null
      if (prevPage && !prevPage.next_page_token) return null
      const body: Pagination = {
        page_size: 100,
        page_token: prevPage?.next_page_token,
      }
      return [`${path}/list_following`, body] as const
    },
    [isAuthorized]
  )

  const response = useSWRInfinite(
    getKey,
    ([, body]) => readFollowedGroupList(body),
    { revalidateFirstPage: true }
  )

  return usePagination({
    getKey,
    ...response,
  })
}
