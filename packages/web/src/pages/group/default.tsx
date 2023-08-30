import { GROUP_DETAIL_PATH } from '#/App'
import ErrorPlaceholder from '#/components/ErrorPlaceholder'
import Loading from '#/components/Loading'
import { useMyGroupList } from '@yiwen-ai/store'
import { useEffect } from 'react'
import { generatePath, useNavigate } from 'react-router-dom'
import { Xid } from 'xid-ts'

export default function DefaultGroupPage() {
  const {
    isLoading,
    error,
    defaultGroup: { id: gid } = {},
    refreshDefaultGroup,
  } = useMyGroupList()

  useEffect(() => {
    refreshDefaultGroup().catch(() => {})
  }, [refreshDefaultGroup])

  return isLoading ? (
    <Loading />
  ) : error ? (
    <ErrorPlaceholder error={error} />
  ) : gid ? (
    <Redirect gid={gid} />
  ) : null
}

function Redirect({ gid }: { gid: Uint8Array }) {
  const navigate = useNavigate()

  useEffect(() => {
    navigate(
      generatePath(GROUP_DETAIL_PATH, { gid: Xid.fromValue(gid).toString() }),
      { replace: true }
    )
  }, [gid, navigate])

  return null
}
