import { GROUP_DETAIL_PATH } from '#/App'
import ErrorPlaceholder from '#/components/ErrorPlaceholder'
import Loading from '#/components/Loading'
import { BREAKPOINT } from '#/shared'
import { css } from '@emotion/react'
import { useMyGroupList } from '@yiwen-ai/store'
import { useEffect } from 'react'
import { generatePath, useNavigate, useParams } from 'react-router-dom'
import { Xid } from 'xid-ts'

export default function DefaultGroupPage() {
  const params = useParams<{ gid: string; type: string }>()
  let _gid: Xid | undefined = undefined
  if (params.gid) {
    try {
      _gid = Xid.fromValue(params.gid || '')
    } catch (_) {
      // ignore
    }
  }

  const { isLoading, error, defaultGroup: { id: gid } = {} } = useMyGroupList()

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
      ) : (
        <Redirect gid={_gid || gid} />
      )}
    </div>
  )
}

function Redirect({ gid }: { gid: Xid | Uint8Array | undefined }) {
  const navigate = useNavigate()

  useEffect(() => {
    navigate(
      gid
        ? generatePath(GROUP_DETAIL_PATH, {
            gid: Xid.fromValue(gid).toString(),
            type: 'collection',
          })
        : generatePath('/'),
      { replace: true }
    )
  }, [gid, navigate])

  return null
}
