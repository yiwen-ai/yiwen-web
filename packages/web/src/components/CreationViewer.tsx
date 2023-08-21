import { BREAKPOINT } from '#/shared'
import { css } from '@emotion/react'
import { useCreation } from '@yiwen-ai/store'
import { type HTMLAttributes } from 'react'
import { useResizeDetector } from 'react-resize-detector'
import CommonViewer from './CommonViewer'
import ErrorPlaceholder from './ErrorPlaceholder'
import Loading from './Loading'

export interface CreationViewerProps extends HTMLAttributes<HTMLDivElement> {
  gid: string
  cid: string
}

export function CreationViewer({ gid, cid, ...props }: CreationViewerProps) {
  const { width = 0, ref } = useResizeDetector<HTMLDivElement>()
  const isNarrow = width <= BREAKPOINT.small

  //#region creation
  const { creation, error, isLoading } = useCreation(gid, cid)
  //#endregion

  return (
    <div
      {...props}
      ref={ref}
      css={css`
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 60px 0;
        ${isNarrow &&
        css`
          padding: 20px 0;
        `}
      `}
    >
      {isLoading ? (
        <Loading />
      ) : error ? (
        <ErrorPlaceholder error={error} />
      ) : creation ? (
        <>
          <CommonViewer item={creation} isNarrow={isNarrow} />
        </>
      ) : null}
    </div>
  )
}
