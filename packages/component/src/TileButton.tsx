import { css, useTheme } from '@emotion/react'
import { forwardRef, memo, type ButtonHTMLAttributes } from 'react'
import { Icon, type IconName } from '.'

export interface TileButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {}

export const TileButton = memo(
  forwardRef(function TileButton(
    props: TileButtonProps,
    ref: React.Ref<HTMLButtonElement>
  ) {
    const theme = useTheme()
    const colorCSS = theme.color.button.tile

    return (
      <button
        {...props}
        ref={ref}
        css={css`
          padding: 12px 24px;
          text-align: left;
          border-radius: 12px;
          border: 1px solid ${colorCSS.border};
          background-color: ${colorCSS.background};
          color: ${colorCSS.text};
          cursor: pointer;
          :hover {
            border-color: ${colorCSS.hover.border};
            background-color: ${colorCSS.hover.background};
            color: ${colorCSS.hover.text};
          }
        `}
      >
        {props.children}
      </button>
    )
  })
)

export interface StructuredTileButtonProps extends TileButtonProps {
  text: string
  icon: IconName
  description?: string
}

export const StructuredTileButton = memo(function StructuredTileButton({
  text,
  icon,
  description,
  ...props
}: StructuredTileButtonProps) {
  const theme = useTheme()

  return (
    <TileButton {...props}>
      <div
        css={css`
          display: flex;
          align-items: ${description ? 'flex-start' : 'center'};
          justify-content: space-between;
          gap: 24px;
        `}
      >
        <span css={theme.typography.bodyBold}>{text}</span>
        <Icon name={icon} size='small' />
      </div>
      {description && (
        <div
          css={css`
            ${theme.typography.tooltip}
            color: ${theme.color.body.secondary};
          `}
        >
          {description}
        </div>
      )}
    </TileButton>
  )
})
