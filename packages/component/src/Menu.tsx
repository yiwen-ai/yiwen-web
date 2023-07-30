import { css, useTheme } from '@emotion/react'
import {
  RGBA,
  mergeAnchorProps,
  mergeForwardedRef,
  type AnchorProps,
} from '@yiwen-ai/util'
import {
  forwardRef,
  memo,
  type HTMLAttributes,
  type LiHTMLAttributes,
} from 'react'
import { Icon } from './Icon'
import { Popover, pickPopoverProps, type PopoverProps } from './Popover'

export interface MenuProps
  extends HTMLAttributes<HTMLUListElement>,
    PopoverProps {
  items?: readonly MenuItemProps[]
}

export const Menu = memo(
  forwardRef(function Menu(props: MenuProps, ref: React.Ref<HTMLUListElement>) {
    const theme = useTheme()
    const {
      popoverProps,
      restProps: { items, ...menuProps },
    } = pickPopoverProps(props)

    const render = () => (
      <ul role='menu' {...menuProps} ref={ref}>
        {items?.length
          ? items.map((item, index) => <MenuItem key={index} {...item} />)
          : menuProps.children}
      </ul>
    )

    if (!popoverProps.anchor) return render()

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
        {render()}
      </Popover>
    )
  })
)

export interface MenuItemProps
  extends Omit<LiHTMLAttributes<HTMLLIElement>, 'children'> {
  disabled?: boolean | undefined
  before?: JSX.Element
  after?: JSX.Element
  label: string | JSX.Element
  description?: string | JSX.Element
  children?: readonly MenuItemProps[]
}

export const MenuItem = memo(
  forwardRef(function MenuItem(
    {
      disabled,
      before,
      after,
      label,
      description,
      children,
      ...props
    }: MenuItemProps,
    ref: React.ForwardedRef<HTMLLIElement>
  ) {
    const theme = useTheme()

    const render = (
      props: LiHTMLAttributes<HTMLLIElement>,
      ref: React.Ref<HTMLLIElement>
    ) => (
      <li
        role='menuitem'
        aria-disabled={disabled}
        data-disabled={disabled ? '' : undefined}
        {...props}
        ref={ref}
        css={css`
          min-height: 36px;
          padding: 4px 12px;
          box-sizing: border-box;
          display: flex;
          gap: 8px;
          border-radius: 8px;
          &[data-disabled] {
            opacity: 0.5;
            cursor: not-allowed;
          }
          :not([data-disabled]) {
            cursor: pointer;
            :hover {
              background: ${theme.color.menu.item.hover.background};
            }
          }
        `}
      >
        {before && (
          <span
            css={css`
              height: ${theme.typography.body.lineHeight};
              display: flex;
              align-items: center;
              color: ${theme.palette.grayLight};
            `}
          >
            {before}
          </span>
        )}
        <div
          css={css`
            flex: 1;
            display: flex;
            flex-direction: column;
          `}
        >
          <div
            css={css`
              display: flex;
              gap: 8px;
            `}
          >
            <span
              css={css`
                flex: 1;
              `}
            >
              {label}
            </span>
            {(after || children?.length) && (
              <span
                css={css`
                  height: ${theme.typography.body.lineHeight};
                  display: flex;
                  align-items: center;
                  color: ${RGBA(theme.palette.grayLight, 0.4)};
                `}
              >
                {after ?? <Icon name='arrowcircleright' size='small' />}
              </span>
            )}
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
        </div>
      </li>
    )

    if (!children?.length) return render(props, ref)

    return (
      <Menu
        anchor={(anchorProps: AnchorProps<HTMLLIElement>) =>
          render(
            mergeAnchorProps(props, anchorProps),
            mergeForwardedRef(ref, anchorProps.ref)
          )
        }
        items={children}
      />
    )
  })
)
