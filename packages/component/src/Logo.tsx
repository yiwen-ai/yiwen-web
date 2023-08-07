import { css, useTheme } from '@emotion/react'
import { forwardRef, memo, type SVGAttributes } from 'react'
import { useIntl } from 'react-intl'
import { ReactComponent as SVG } from './logo.svg'

export type LogoSize = 'small' | 'medium'

const SizeDict: Record<LogoSize, number> = {
  small: 24,
  medium: 36,
}

export interface LogoProps extends SVGAttributes<SVGSVGElement> {
  size?: LogoSize | number
}

export const Logo = memo(
  forwardRef(function Logo(
    { size = 'medium', ...props }: LogoProps,
    ref: React.Ref<SVGSVGElement>
  ) {
    const intl = useIntl()
    const theme = useTheme()
    const width = typeof size === 'number' ? size : SizeDict[size]

    return (
      <SVG
        role='img'
        aria-label={intl.formatMessage({ defaultMessage: '亿文' })}
        {...props}
        css={css`
          width: ${width}px;
          height: ${width}px;
          color: ${theme.name === 'dark'
            ? theme.palette.grayLight1
            : theme.palette.primaryNormal};
          fill: currentColor;
          user-select: none;
        `}
      />
    )
  })
)
