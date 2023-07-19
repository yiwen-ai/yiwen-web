import { css, useTheme, type CSSObject } from '@emotion/react'
import { forwardRef, memo, type HTMLAttributes } from 'react'
import { useIntl } from 'react-intl'

export type BrandSize = 'medium' | 'large'

const SizeDict: Record<BrandSize, CSSObject> = {
  medium: {
    fontSize: '20px',
    fontWeight: 700,
    lineHeight: '28px',
  },
  large: {
    fontSize: '36px',
    fontWeight: 900,
    lineHeight: '44px',
  },
}

export interface BrandProps extends HTMLAttributes<HTMLElement> {
  size?: BrandSize
}

export const Brand = memo(
  forwardRef(function Brand(
    { size = 'medium', ...props }: BrandProps,
    ref: React.Ref<HTMLElement>
  ) {
    const intl = useIntl()
    const theme = useTheme()

    return (
      <strong
        {...props}
        ref={ref}
        css={css`
          ${SizeDict[size]}
          font-family: Mada;
          color: ${theme.name === 'dark'
            ? theme.palette.grayLight1
            : theme.palette.primaryNormal};
          vertical-align: top;
        `}
      >
        {intl.formatMessage({ defaultMessage: 'yiwen.ai' })}
      </strong>
    )
  })
)
