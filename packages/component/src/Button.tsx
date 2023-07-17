import { css, useTheme, type CSSObject, type Theme } from '@emotion/react'
import { forwardRef, memo, type ButtonHTMLAttributes } from 'react'

export type ButtonSize = 'small' | 'medium' | 'large'

const SizeDict: Record<ButtonSize, (theme: Theme) => CSSObject> = {
  small: () => ({
    height: 24,
    paddingLeft: 16,
    paddingRight: 16,
    borderWidth: 1,
    borderRadius: 10,
  }),
  medium: () => ({
    height: 32,
    paddingLeft: 24,
    paddingRight: 24,
    borderWidth: 1,
    borderRadius: 12,
  }),
  large: () => ({
    height: 48,
    paddingLeft: 36,
    paddingRight: 36,
    borderWidth: 2,
    borderRadius: 20,
  }),
}

export type ButtonColor = 'primary' | 'secondary'

export type ButtonVariant = 'contained' | 'outlined'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: ButtonSize
  color?: ButtonColor
  variant?: ButtonVariant
}

export const Button = memo(
  forwardRef(function Button(
    {
      size = 'medium',
      color = 'primary',
      variant = color === 'primary' ? 'contained' : 'outlined',
      ...props
    }: ButtonProps,
    ref: React.Ref<HTMLButtonElement>
  ) {
    const theme = useTheme()
    const styles = theme.color.button[color][variant]

    return (
      <button
        {...props}
        ref={ref}
        css={css`
          ${SizeDict[size](theme)}
          border-style: solid;
          border-color: ${styles.border};
          background-color: ${styles.background};
          color: ${styles.text};
          cursor: ${props.disabled ? 'not-allowed' : 'pointer'};
          :not(:disabled):hover {
            border-color: ${styles.hover.border};
            background-color: ${styles.hover.background};
            color: ${styles.hover.text};
          }
          /* TODO: focus state */
          /* TODO: active state */
        `}
      >
        {props.children}
      </button>
    )
  })
)
