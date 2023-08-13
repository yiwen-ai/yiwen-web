import { GROUP_DETAIL_PATH } from '#/App'
import Loading from '#/components/Loading'
import { css } from '@emotion/react'
import { toMessage, useMyGroupList } from '@yiwen-ai/store'
import { useEffect } from 'react'
import { generatePath, useNavigate } from 'react-router-dom'
import { Xid } from 'xid-ts'

export default function DefaultGroup() {
  const navigate = useNavigate()
  const { defaultGroup, error, isLoading } = useMyGroupList()
  const gid = defaultGroup?.id

  useEffect(() => {
    if (gid) {
      navigate(
        generatePath(GROUP_DETAIL_PATH, { gid: Xid.fromValue(gid).toString() }),
        { replace: true }
      )
    }
  }, [gid, navigate])

  return isLoading ? (
    <Loading />
  ) : (
    <div
      css={css`
        padding: 60px 24px;
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      `}
    >
      {toMessage(error)}
    </div>
  )
}
