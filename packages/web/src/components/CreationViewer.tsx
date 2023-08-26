import { css } from '@emotion/react'
import { useCreation } from '@yiwen-ai/store'
import { type HTMLAttributes } from 'react'
import CommonViewer from './CommonViewer'
import ErrorPlaceholder from './ErrorPlaceholder'
import Loading from './Loading'

export interface CreationViewerProps extends HTMLAttributes<HTMLDivElement> {
  gid: string
  cid: string
}

export function CreationViewer({ gid, cid, ...props }: CreationViewerProps) {
  const { creation, error, isLoading } = useCreation(gid, cid)

  return (
    <div
      {...props}
      css={css`
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 60px 0;
      `}
    >
      {isLoading ? (
        <Loading />
      ) : error ? (
        <ErrorPlaceholder error={error} />
      ) : creation ? (
        <CommonViewer item={creation} isNarrow={false} />
      ) : null}
    </div>
  )
}
