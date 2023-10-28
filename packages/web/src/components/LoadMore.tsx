import { css } from '@emotion/react'
import { Button, Spinner } from '@yiwen-ai/component'
import { useMemo } from 'react'
import { useIntl } from 'react-intl'

interface LoadMoreProps extends React.HTMLAttributes<HTMLDivElement> {
  hasMore: boolean
  isLoadingMore: boolean
  onLoadMore: React.MouseEventHandler<HTMLButtonElement>
}

export function LoadMore({
  hasMore,
  isLoadingMore,
  onLoadMore,
  ...props
}: LoadMoreProps) {
  const intl = useIntl()

  const content = isLoadingMore ? (
    <Spinner />
  ) : hasMore ? (
    <Button color='primary' variant='outlined' onClick={onLoadMore}>
      {intl.formatMessage({ defaultMessage: '加载更多' })}
    </Button>
  ) : null

  return content ? (
    <div
      {...props}
      css={css`
        height: 80px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      `}
    >
      {content}
    </div>
  ) : null
}

interface AutoLoadMoreProps extends React.HTMLAttributes<HTMLDivElement> {
  hasMore: boolean
  isLoadingMore: boolean
  onLoadMore: () => void
}

export function AutoLoadMore({
  hasMore,
  isLoadingMore,
  onLoadMore,
  ...props
}: AutoLoadMoreProps) {
  useMemo(() => {
    hasMore && !isLoadingMore && onLoadMore()
  }, [hasMore, isLoadingMore, onLoadMore])

  const content = isLoadingMore ? <Spinner /> : null

  return content ? (
    <div
      {...props}
      css={css`
        height: 80px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      `}
    >
      {content}
    </div>
  ) : null
}
