import { BREAKPOINT } from '#/shared'
import { css, useTheme } from '@emotion/react'
import { useIntl } from 'react-intl'
import { useSearchParams } from 'react-router-dom'

export default function LoginStatePage() {
  const intl = useIntl()
  const theme = useTheme()
  const [params] = useSearchParams()
  const status = Number(params.get('status'))

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
          ? intl.formatMessage({ defaultMessage: '登录成功' })
          : intl.formatMessage({ defaultMessage: '登录失败' })}
      </div>
      <div
        css={css`
          margin-top: 8px;
          color: ${theme.color.body.secondary};
        `}
      >
        {status === 200
          ? intl.formatMessage({
              defaultMessage: '已登录成功，请关闭此页面',
            })
          : intl.formatMessage({
              defaultMessage: '请稍后重试',
            })}
      </div>
    </div>
  )
}
