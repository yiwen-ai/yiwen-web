import { css } from '@emotion/react'
import { Button } from '@yiwen-ai/component'
import { useAuth } from '@yiwen-ai/store'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'

export default function AuthorizedFallback({
  description,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  description?: string
}) {
  const intl = useIntl()
  const {
    dialog: { show: showAuthDialog },
  } = useAuth()

  return (
    <div
      {...props}
      css={css`
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 16px;
      `}
    >
      <span
        css={(theme) => css`
          color: ${theme.color.body.secondary};
        `}
      >
        {description || intl.formatMessage({ defaultMessage: '请登录后再试' })}
      </span>
      <div
        css={css`
          display: flex;
          align-items: center;
          gap: 16px;
        `}
      >
        <Button
          color='primary'
          variant='outlined'
          size='small'
          onClick={showAuthDialog}
        >
          {intl.formatMessage({ defaultMessage: '登录' })}
        </Button>
        <Link
          to='/'
          css={css`
            display: flex;
          `}
        >
          <Button color='secondary' variant='outlined' size='small'>
            {intl.formatMessage({ defaultMessage: '返回首页' })}
          </Button>
        </Link>
      </div>
    </div>
  )
}
