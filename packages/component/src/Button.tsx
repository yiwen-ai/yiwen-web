import { css, useTheme, type CSSObject, type Theme } from '@emotion/react'
import { forwardRef, memo, useMemo, type ButtonHTMLAttributes } from 'react'
import { Icon, type IconName, type IconProps } from './Icon'
import { textEllipsis } from './common'

export type ButtonSize = 'small' | 'medium' | 'large'

const SizeDict: Record<ButtonSize, (theme: Theme) => Readonly<CSSObject>> = {
  small: (theme) => ({
    minHeight: 24,
    paddingLeft: 8,
    paddingRight: 8,
    gap: 4,
    borderWidth: 1,
    borderRadius: 6,
    fontSize: theme.typography.tooltip.fontSize,
    fontWeight: theme.typography.tooltip.fontWeight,
    lineHeight: theme.typography.tooltip.lineHeight,
  }),
  medium: () => ({
    minHeight: 32,
    paddingLeft: 16,
    paddingRight: 16,
    gap: 8,
    borderWidth: 1,
    borderRadius: 8,
  }),
  large: () => ({
    minHeight: 40,
    paddingLeft: 24,
    paddingRight: 24,
    gap: 12,
    borderWidth: 2,
    borderRadius: 10,
  }),
}

export type ButtonColor = 'primary' | 'secondary'

export type ButtonVariant = 'contained' | 'outlined' | 'text'

export type ButtonShape = 'square' | 'rounded' | 'circle'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  color: ButtonColor
  variant?: ButtonVariant
  shape?: ButtonShape
  size?: ButtonSize
  readOnly?: boolean
  htmlFor?: string
}

export const Button = memo(
  forwardRef(function Button(
    {
      color,
      variant = color === 'primary' ? 'contained' : 'outlined',
      shape = 'rounded',
      size = 'medium',
      readOnly,
      disabled,
      ...props
    }: ButtonProps,
    ref: React.Ref<HTMLButtonElement>
  ) {
    const theme = useTheme()
    const sizeCSS = useMemo(() => {
      const css: CSSObject = { ...SizeDict[size](theme) }
      if (variant === 'text') {
        css.paddingLeft = css.paddingRight = 8
      }
      if (shape === 'circle') {
        css.borderRadius = css.minWidth = css.minHeight
        css.paddingLeft = css.paddingRight = undefined
      } else if (shape === 'square') {
        css.borderRadius = 0
      }
      return css
    }, [shape, size, theme, variant])
    const colorCSS = theme.color.button[color][variant]

    return (
      <button
        type='button'
        data-readonly={readOnly ? '' : undefined}
        disabled={disabled || readOnly}
        {...props}
        ref={ref}
        css={css`
          display: inline-flex;
          align-items: center;
          justify-content: center;
          ${sizeCSS}
          border-style: solid;
          ${textEllipsis}
          cursor: ${disabled
            ? 'not-allowed'
            : readOnly
            ? 'default'
            : 'pointer'};
          border-color: ${colorCSS.border};
          background-color: ${colorCSS.background};
          color: ${colorCSS.text};
          :hover {
            border-color: ${colorCSS.hover.border};
            background-color: ${colorCSS.hover.background};
            color: ${colorCSS.hover.text};
          }
          /* TODO: focus state */
          /* TODO: active state */
          :disabled {
            border-color: ${colorCSS.disabled.border};
            background-color: ${colorCSS.disabled.background};
            color: ${colorCSS.disabled.text};
          }
          &[data-readonly] {
            border-color: ${colorCSS.border};
            background-color: ${colorCSS.background};
            color: ${colorCSS.text};
          }
        `}
      />
    )
  })
)

export interface IconButtonProps extends Omit<ButtonProps, 'color'> {
  iconName: IconName
  iconSize?: IconProps['size']
  color?: ButtonProps['color']
}

export const IconButton = memo(
  forwardRef(function IconButton(
    {
      iconName,
      color = 'secondary',
      variant = 'text',
      shape = 'circle',
      size = 'small',
      iconSize = size,
      htmlFor,
      ...props
    }: IconButtonProps,
    ref: React.Ref<HTMLButtonElement>
  ) {
    const theme = useTheme()

    return (
      <Button
        aria-label={iconName}
        color={color}
        variant={variant}
        shape={shape}
        size={size}
        {...props}
        ref={ref}
        css={{
          minWidth: SizeDict[size](theme).minHeight,
          paddingLeft: 0,
          paddingRight: 0,
          border: 'none',
        }}
      >
        {htmlFor ? (
          <label
            htmlFor={htmlFor}
            css={css`
              width: 100%;
              cursor: pointer;
              display: flex;
              align-content: center;
              justify-content: center;
              align-items: center;
            `}
          >
            <Icon
              name={iconName}
              size={iconSize}
              css={css`
                outline: none;
              `}
            />
            {props.children}
          </label>
        ) : (
          <Icon
            name={iconName}
            size={iconSize}
            css={css`
              outline: none;
            `}
          />
        )}
      </Button>
    )
  })
)
