import { GroupViewType } from '#/store/useGroupDetailPage'
import { css } from '@emotion/react'
import { usePublication } from '@yiwen-ai/store'
import { useEffect, useState } from 'react'
import CommonViewer from './CommonViewer'

export default function YiwenCoin(props: React.HTMLAttributes<HTMLElement>) {
  const defaultLanguage = 'zho'

  const [params, setParams] = useState({
    _gid: null,
    _cid: 'ck4o3j2pnj4fb1t340pg',
    _language: null as string | null,
    _version: null,
  })

  const { isLoading, error, publication } = usePublication(
    params._gid,
    params._cid,
    params._language,
    params._version,
    { baseURL: 'https://api.yiwen.ai/' }
  )

  useEffect(() => {
    if (!isLoading && error) {
      setParams((params) => ({
        ...params,
        _language: defaultLanguage,
      }))
    }
  }, [error, isLoading])

  return (
    <CommonViewer
      type={GroupViewType.Publication}
      item={publication}
      isNarrow={false}
      css={css`
        padding: 0;
        > a {
          display: none;
        }
      `}
    />
  )
}
