import { GROUP_DETAIL_PATH } from '#/App'
import ErrorPlaceholder from '#/components/ErrorPlaceholder'
import Loading from '#/components/Loading'
import { BREAKPOINT } from '#/shared'
import { css } from '@emotion/react'
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

  return (
    <div
      css={css`
        width: 100%;
        max-width: ${BREAKPOINT.medium}px;
        margin: auto;
        padding: 80px;
        box-sizing: border-box;
        @media (max-width: ${BREAKPOINT.small}px) {
          padding-left: 40px;
          padding-right: 40px;
        }
      `}
    >
      {isLoading ? (
        <Loading />
      ) : error ? (
        <ErrorPlaceholder error={error} />
      ) : gid ? (
        <Redirect gid={gid} />
      ) : null}
    </div>
  )
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
