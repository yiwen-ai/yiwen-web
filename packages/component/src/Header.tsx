import { css } from '@emotion/react'
import { forwardRef, memo, useCallback, type HTMLAttributes } from 'react'
import { Link } from 'react-router-dom'
import { AccountManager } from './AccountManager'
import { Brand } from './Brand'
import { Logo } from './Logo'
import { type MenuProps } from './Menu'

export interface HeaderProps extends HTMLAttributes<HTMLElement> {
  brand?: boolean
  userMenu?: MenuProps
}

export const Header = memo(
  forwardRef(function Header(
    { brand, userMenu, ...props }: HeaderProps,
    ref: React.Ref<HTMLElement>
  ) {
    const handleClick = useCallback(
      (ev: React.MouseEvent<HTMLAnchorElement>) => {
        if (ev.detail == 2) {
          window.location.reload() // for PWA that has no refresh button
        }
      },
      []
    )

    return (
      <header
        {...props}
        ref={ref}
        css={css`
          height: 68px;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        `}
      >
        <Link
          to='/'
          onClick={handleClick}
          css={css`
            display: flex;
            align-items: center;
            gap: 12px;
          `}
        >
          <Logo role='heading' aria-level={1} />
          {brand && <Brand />}
        </Link>
        {props.children}
        <AccountManager {...userMenu} />
      </header>
    )
  })
)
