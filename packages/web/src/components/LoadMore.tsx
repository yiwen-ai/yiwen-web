import { css } from '@emotion/react'
import { Button, Spinner } from '@yiwen-ai/component'
import { useIntl } from 'react-intl'

interface LoadMoreProps extends React.HTMLAttributes<HTMLDivElement> {
  isLoading: boolean
  hasMore: boolean
  loadMore: React.MouseEventHandler<HTMLButtonElement>
}

export default function LoadMore({
  isLoading,
  hasMore,
  loadMore,
  ...props
}: LoadMoreProps) {
  const intl = useIntl()

  const content = isLoading ? (
    <Spinner />
  ) : hasMore ? (
    <Button color='primary' variant='outlined' onClick={loadMore}>
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
