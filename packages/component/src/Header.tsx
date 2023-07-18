import { css } from '@emotion/react'
import { forwardRef, memo, type HTMLAttributes } from 'react'
import { Link } from 'react-router-dom'
import { AccountManager } from './AccountManager'
import { Logo } from './Logo'

export interface HeaderProps extends HTMLAttributes<HTMLElement> {}

export const Header = memo(
  forwardRef(function Header(props: HeaderProps, ref: React.Ref<HTMLElement>) {
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
        <Link to='/'>
          <Logo role='heading' aria-level={1} />
        </Link>
        {props.children}
        <AccountManager />
      </header>
    )
  })
)
