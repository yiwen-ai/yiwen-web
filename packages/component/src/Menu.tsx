import { css, useTheme } from '@emotion/react'
import {
  forwardRef,
  memo,
  type HTMLAttributes,
  type LiHTMLAttributes,
} from 'react'
import { Popover, pickPopoverProps, type PopoverProps } from './Popover'

export interface MenuProps
  extends HTMLAttributes<HTMLUListElement>,
    PopoverProps {}

export const Menu = memo(
  forwardRef(function Menu(props: MenuProps, ref: React.Ref<HTMLUListElement>) {
    const theme = useTheme()
    const { popoverProps, restProps: menuProps } = pickPopoverProps(props)
    const menu = <ul role='menu' {...menuProps} ref={ref} />
    if (!popoverProps.anchor) return menu
    return (
      <Popover
        {...popoverProps}
        css={css`
          width: 208px;
          padding: 20px 12px;
          box-sizing: border-box;
          border: 1px solid ${theme.color.menu.border};
          background: ${theme.color.menu.background};
        `}
      >
        {menu}
      </Popover>
    )
  })
)

export interface MenuItemProps extends LiHTMLAttributes<HTMLLIElement> {
  disabled?: boolean
}

export const MenuItem = memo(function MenuItem({
  disabled,
  ...props
}: MenuItemProps) {
  const theme = useTheme()

  return (
    <li
      role='menuitem'
      aria-disabled={disabled}
      {...props}
      css={css`
        min-height: 36px;
        padding: 4px 12px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        border-radius: 8px;
        ${disabled
          ? css`
              opacity: 0.5;
              cursor: not-allowed;
            `
          : css`
              cursor: pointer;
              :hover {
                background: ${theme.color.menu.item.hover.background};
              }
            `}
      `}
    />
  )
})
