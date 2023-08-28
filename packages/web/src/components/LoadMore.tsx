import { css } from '@emotion/react'
import { Button, Spinner } from '@yiwen-ai/component'
import { useIntl } from 'react-intl'

interface LoadMoreProps extends React.HTMLAttributes<HTMLDivElement> {
  isLoadingMore: boolean
  hasMore: boolean
  onLoadMore: React.MouseEventHandler<HTMLButtonElement>
}

export default function LoadMore({
  isLoadingMore,
  hasMore,
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
