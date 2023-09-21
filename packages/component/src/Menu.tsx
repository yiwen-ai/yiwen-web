import { css, useTheme } from '@emotion/react'
import {
  RGBA,
  isArray,
  mergeAnchorProps,
  mergeClickProps,
  mergeForwardedRef,
  useIsMounted,
  useRefCallback,
  type AnchorProps,
  type ModalRef,
} from '@yiwen-ai/util'
import {
  createContext,
  forwardRef,
  memo,
  useContext,
  type HTMLAttributes,
  type LiHTMLAttributes,
} from 'react'
import { Icon } from './Icon'
import { Popover, pickPopoverProps, type PopoverProps } from './Popover'

export interface MenuProps
  extends HTMLAttributes<HTMLUListElement>,
    PopoverProps {
  items?: readonly MenuItemProps[] | undefined
}

export const Menu = memo(
  forwardRef(function Menu(
    props: MenuProps,
    forwardedRef: React.ForwardedRef<ModalRef>
  ) {
    const theme = useTheme()
    const {
      popoverProps,
      restProps: { items, ...menuProps },
    } = pickPopoverProps(props)
    const [ref, setRef] = useRefCallback(forwardedRef)
    const parentRef = useContext(MenuContext)

    const render = () => (
      <ul
        role='menu'
        {...menuProps}
        css={css`
          padding-left: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        `}
      >
        {items?.length
          ? items.map((item, index) => <MenuItem key={index} {...item} />)
          : menuProps.children}
      </ul>
    )

    if (!popoverProps.anchor) return render()

    return (
      <Popover
        {...popoverProps}
        ref={setRef}
        css={css`
          width: 208px;
          padding: 20px 12px;
          border: 1px solid ${theme.color.menu.border};
          background: ${theme.color.menu.background};
        `}
      >
        <MenuContext.Provider value={parentRef || ref}>
          {render()}
        </MenuContext.Provider>
      </Popover>
    )
  })
)

const MenuContext = createContext<ModalRef | null>(null)

export interface MenuItemProps
  extends Omit<LiHTMLAttributes<HTMLLIElement>, 'children'> {
  before?: JSX.Element | false | null | undefined
  after?: JSX.Element | false | null | undefined
  label: string | JSX.Element
  dir?: string | undefined
  description?: string | JSX.Element
  danger?: boolean | undefined
  disabled?: boolean | undefined
  readOnly?: boolean | undefined
  closeOnClick?: boolean | number | undefined
  children?: readonly MenuItemProps[] | JSX.Element | null | undefined
}

export const MenuItem = memo(
  forwardRef(function MenuItem(
    {
      before,
      after,
      label,
      dir,
      description,
      danger,
      disabled,
      readOnly,
      closeOnClick = true,
      children,
      ...props
    }: MenuItemProps,
    ref: React.ForwardedRef<HTMLLIElement>
  ) {
    const theme = useTheme()
    const menuRef = useContext(MenuContext)
    const isMounted = useIsMounted()

    const render = (
      { onClick, ...props }: LiHTMLAttributes<HTMLLIElement>,
      ref: React.Ref<HTMLLIElement>
    ) => (
      <li
        role='menuitem'
        tabIndex={0}
        aria-disabled={disabled || readOnly}
        data-disabled={disabled ? '' : undefined}
        data-readonly={readOnly ? '' : undefined}
        {...mergeClickProps(props, (ev) => {
          !disabled &&
            !readOnly &&
            onClick?.(ev as React.MouseEvent<HTMLLIElement>)
        })}
        ref={ref}
        css={css`
          min-height: 36px;
          padding: 4px 12px;
          box-sizing: border-box;
          display: flex;
          align-items: flex-start;
          gap: 8px;
          border-radius: 8px;
          cursor: pointer;
          :hover {
            background: ${theme.color.menu.item.hover.background};
          }
          &[data-readonly] {
            cursor: default;
            :hover {
              background: unset;
            }
          }
          &[data-disabled] {
            opacity: 0.5;
            cursor: not-allowed;
            :hover {
              background: unset;
            }
          }
        `}
      >
        {before && (
          <span
            css={css`
              min-height: ${theme.typography.body.lineHeight};
              display: flex;
              align-items: center;
              color: ${danger
                ? theme.color.body.danger
                : theme.color.body.secondary};
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
              align-items: flex-start;
              gap: 8px;
            `}
          >
            <span
              dir={dir ? dir : undefined}
              css={css`
                flex: 1;
                text-align: ${dir === 'rtl' ? 'right' : undefined};
                color: ${danger && theme.color.body.danger};
              `}
            >
              {label}
            </span>
            {(after || children) && (
              <span
                css={css`
                  min-height: ${theme.typography.body.lineHeight};
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

    if (!children) {
      const { onClick } = props
      return render(
        {
          ...props,
          onClick: (ev) => {
            onClick?.(ev)
            if (!ev.isDefaultPrevented()) {
              if (closeOnClick === true) {
                menuRef?.close()
              } else if (typeof closeOnClick === 'number') {
                setTimeout(() => {
                  isMounted() && menuRef?.close()
                }, closeOnClick)
              }
            }
          },
        },
        ref
      )
    }

    const anchor = (anchorProps: AnchorProps<HTMLLIElement>) => {
      return render(
        mergeAnchorProps(props, anchorProps),
        mergeForwardedRef(ref, anchorProps.ref)
      )
    }

    return (
      <Menu
        anchor={anchor}
        placement='right-start'
        items={isArray(children) ? children : undefined}
      >
        {isArray(children) ? null : children}
      </Menu>
    )
  })
)
