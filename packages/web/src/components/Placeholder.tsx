import { css, useTheme } from '@emotion/react'
import { useIntl } from 'react-intl'

export default function Placeholder() {
  const intl = useIntl()
  const theme = useTheme()

  return (
    <div
      css={css`
        height: 80px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: ${theme.color.body.secondary};
      `}
    >
      {intl.formatMessage({ defaultMessage: '暂无数据，请稍后再试' })}
    </div>
  )
}
