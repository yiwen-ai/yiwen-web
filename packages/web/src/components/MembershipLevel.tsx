import { ReactComponent as Level0 } from '#/assets/membership-level-0.svg'
import { ReactComponent as Level1 } from '#/assets/membership-level-1.svg'
import { ReactComponent as Level2 } from '#/assets/membership-level-2.svg'
import { ReactComponent as Level3 } from '#/assets/membership-level-3.svg'
import { ReactComponent as Level4 } from '#/assets/membership-level-4.svg'
import { ReactComponent as Level5 } from '#/assets/membership-level-5.svg'
import { ReactComponent as Level6 } from '#/assets/membership-level-6.svg'
import { ReactComponent as Level7 } from '#/assets/membership-level-7.svg'
import { ReactComponent as Custom } from '#/assets/membership-level-custom.svg'
import { css } from '@emotion/react'
import { useIntl } from 'react-intl'

const KnownLevelDict: Record<number, typeof Custom> = {
  0: Level0,
  1: Level1,
  2: Level2,
  3: Level3,
  4: Level4,
  5: Level5,
  6: Level6,
  7: Level7,
}

export default function MembershipLevel({
  level,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  level: number
}) {
  const intl = useIntl()
  const KnownLevel = KnownLevelDict[level]

  return (
    <div
      aria-label={intl.formatMessage({ defaultMessage: '会员等级' })}
      {...props}
      css={css`
        position: relative;
      `}
    >
      {KnownLevel ? (
        <KnownLevel aria-label={String(level)} />
      ) : (
        <>
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
              font-size: 40px;
              font-weight: 700;
              line-height: 0;
              margin-top: -10px;
            `}
          >
            <span>{level}</span>
          </div>
        </>
      )}
    </div>
  )
}
