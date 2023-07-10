import { css } from '@emotion/react'
import { memo } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { AccountManager } from './AccountManager'
import { Logo } from './Logo'

export interface HeaderLink {
  to: string
  label: string
}

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  title: string
  menu: readonly HeaderLink[]
}

export const Header = memo(function Header({
  title,
  menu,
  ...props
}: HeaderProps) {
  return (
    <header
      {...props}
      css={css`
        height: 68px;
        padding: 0 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
      `}
    >
      <div
        css={css`
          display: flex;
          align-items: center;
        `}
      >
        <Link to="/">
          <h1>
            <Logo title={title} />
          </h1>
        </Link>
        <nav
          css={css`
            margin-left: 24px;
          `}
        >
          <ul
            css={css`
              display: flex;
              align-items: center;
            `}
          >
            {menu.map((link, index) => (
              <li key={index}>
                <NavLink
                  to={link.to}
                  className={({ isActive, isPending }) =>
                    isActive ? 'active' : isPending ? 'pending' : ''
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div
        css={css`
          display: flex;
          align-items: center;
          gap: 40px;
        `}
      >
        <AccountManager />
      </div>
    </header>
  )
})
