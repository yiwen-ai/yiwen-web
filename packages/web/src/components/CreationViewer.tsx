import { BREAKPOINT } from '#/shared'
import { GroupViewType } from '#/store/useGroupDetailPage'
import { css } from '@emotion/react'
import { Button } from '@yiwen-ai/component'
import { type CreationOutput, type Language } from '@yiwen-ai/store'
import { type HTMLAttributes } from 'react'
import { useResizeDetector } from 'react-resize-detector'
import CommonViewer from './CommonViewer'
import ErrorPlaceholder from './ErrorPlaceholder'
import Loading from './Loading'

export interface CreationViewerProps extends HTMLAttributes<HTMLDivElement> {
  responsive: boolean
  isLoading: boolean
  error: unknown
  creation: CreationOutput | undefined
  currentLanguage: Language | undefined
}

export default function CreationViewer({
  responsive,
  isLoading,
  error,
  creation,
  currentLanguage,
  ...props
}: CreationViewerProps) {
  const { width = 0, ref } = useResizeDetector<HTMLDivElement>()
  const isNarrow = responsive && width <= BREAKPOINT.small

  return (
    <div
      {...props}
      ref={ref}
      css={css`
        flex: 1;
        display: flex;
        flex-direction: column;
      `}
    >
      {isLoading ? (
        <Loading />
      ) : error ? (
        <ErrorPlaceholder error={error} />
      ) : creation ? (
        <>
          <div
            css={css`
              padding: 40px 80px;
              display: flex;
              flex-wrap: wrap;
              align-items: center;
              gap: 24px;
              ${isNarrow &&
              css`
                padding: 24px 16px;
                gap: 16px;
              `}
              > button:last-of-type {
                margin-right: auto;
              }
            `}
          >
            <Button
              color='primary'
              variant='outlined'
              size={isNarrow ? 'small' : 'large'}
              disabled={true}
            >
              {currentLanguage?.nativeName ?? creation.language}
            </Button>
          </div>
          <CommonViewer
            type={GroupViewType.Creation}
            item={creation}
            isNarrow={isNarrow}
          />
        </>
      ) : null}
    </div>
  )
}
