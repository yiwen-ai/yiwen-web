import { ReactComponent as Custom } from '#/assets/membership-level-custom.svg'
import { css } from '@emotion/react'
import { useIntl } from 'react-intl'

export default function MembershipLevel({
  level,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  level: number
}) {
  const intl = useIntl()

  return (
    <div
      aria-label={intl.formatMessage({ defaultMessage: '会员等级' })}
      {...props}
      css={css`
        position: relative;
      `}
    >
      <Custom
        aria-hidden={true}
        css={css`
          display: block;
        `}
      />
      <div
        css={css`
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-family: Roboto, sans-serif;
          font-size: ${level < 10 ? '40px' : '32px'};
          font-weight: 700;
          line-height: 0;
          margin-top: -7px;
          margin-left: -2px;
        `}
      >
        <span>{level}</span>
      </div>
    </div>
  )
}
