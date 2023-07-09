import { memo } from 'react'
import { Avatar } from './Avatar'
import LOGO_URL from './assets/logo.svg'

export interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Logo = memo(function Logo(props: LogoProps) {
  return <Avatar {...props} src={LOGO_URL} alt={props.title as string} />
})

// eslint-disable-next-line react-refresh/only-export-components
export { LOGO_URL }
