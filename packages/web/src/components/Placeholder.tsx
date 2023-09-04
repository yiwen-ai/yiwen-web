import src from '#/assets/placeholder.svg'
import { css } from '@emotion/react'
import { useId } from 'react'
import { useIntl } from 'react-intl'

export default function Placeholder(
  props: React.HTMLAttributes<HTMLDivElement>
) {
  const intl = useIntl()
  const id = useId()

  return (
    <div
      {...props}
      css={css`
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 24px;
      `}
    >
      <img aria-labelledby={id} src={src} width={100} />
      <span id={id}>{intl.formatMessage({ defaultMessage: '暂无内容' })}</span>
    </div>
  )
}
