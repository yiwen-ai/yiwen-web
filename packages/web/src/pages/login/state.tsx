import { BREAKPOINT } from '#/shared'
import { css, useTheme } from '@emotion/react'
import { useAuth } from '@yiwen-ai/store'
import { useEffect } from 'react'
import { useIntl } from 'react-intl'
import { useSearchParams } from 'react-router-dom'

export default function LoginState() {
  const intl = useIntl()
  const theme = useTheme()
  const auth = useAuth()
  const [params] = useSearchParams()
  const status = Number(params.get('status'))
  useEffect(() => auth.callback({ status }), [auth, status])

  return (
    <div
      css={css`
        padding: 80px;
        text-align: center;
        @media (max-width: ${BREAKPOINT.small}px) {
          padding-left: 40px;
          padding-right: 40px;
        }
      `}
    >
      <div css={theme.typography.h1}>
        {status === 200
          ? intl.formatMessage({ defaultMessage: 'Login successful!' })
          : intl.formatMessage({ defaultMessage: 'Login failed!' })}
      </div>
      <div
        css={css`
          margin-top: 8px;
          color: ${theme.color.body.secondary};
        `}
      >
        {status === 200
          ? intl.formatMessage({
              defaultMessage: 'Redirecting to the previous page...',
            })
          : intl.formatMessage({
              defaultMessage: 'Please try again later.',
            })}
      </div>
    </div>
  )
}
