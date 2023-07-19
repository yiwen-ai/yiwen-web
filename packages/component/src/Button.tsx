import { css, useTheme, type CSSObject, type Theme } from '@emotion/react'
import { forwardRef, memo, useMemo, type ButtonHTMLAttributes } from 'react'

export type ButtonSize = 'small' | 'medium' | 'large'

const SizeDict: Record<ButtonSize, (theme: Theme) => Readonly<CSSObject>> = {
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

export type ButtonShape = 'square' | 'rounded' | 'circle'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: ButtonSize
  color?: ButtonColor
  variant?: ButtonVariant
  shape?: ButtonShape
}

export const Button = memo(
  forwardRef(function Button(
    {
      shape = 'rounded',
      size = shape === 'circle' ? 'small' : 'medium',
      color = shape === 'circle' ? 'secondary' : 'primary',
      variant = shape === 'circle' || color === 'primary'
        ? 'contained'
        : 'outlined',
      ...props
    }: ButtonProps,
    ref: React.Ref<HTMLButtonElement>
  ) {
    const theme = useTheme()
    const sizeCSS = useMemo(() => {
      const css: CSSObject = { ...SizeDict[size](theme) }
      if (shape === 'circle') {
        css.width = css.height
        css.paddingLeft = css.paddingRight = undefined
        css.borderRadius = '50%'
        css.display = 'flex'
        css.alignItems = 'center'
        css.justifyContent = 'center'
      } else if (shape === 'square') {
        css.borderRadius = 0
      }
      return css
    }, [shape, size, theme])
    const styles = theme.color.button[color][variant]

    return (
      <button
        {...props}
        ref={ref}
        css={css`
          ${sizeCSS}
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
