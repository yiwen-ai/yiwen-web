import { memo } from 'react'
import { Avatar, type AvatarProps } from './Avatar'
import LOGO_URL from './logo.svg'

export interface LogoProps extends Omit<AvatarProps, 'src' | 'alt'> {
  /**
   * required for accessibility
   */
  title: string
}

export const Logo = memo(function Logo(props: LogoProps) {
  return <Avatar {...props} src={LOGO_URL} alt={props.title} />
})

// eslint-disable-next-line react-refresh/only-export-components
export { LOGO_URL }
