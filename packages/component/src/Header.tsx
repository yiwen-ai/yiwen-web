import { memo } from 'react'
import { Link, NavLink } from 'react-router-dom'

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  title: string
  links: readonly { to: string; label: string }[]
}

export const Header = memo(function Header({
  title,
  links,
  ...props
}: HeaderProps) {
  return (
    <header {...props}>
      <Link to="/">
        <h1>{title}</h1>
      </Link>
      <nav>
        <ul>
          {links.map((link, index) => (
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
    </header>
  )
})
