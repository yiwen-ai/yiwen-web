import { memo } from 'react'
import { useIntl } from 'react-intl'
import { Avatar, type AvatarProps } from './Avatar'
import LOGO_URL from './logo.svg'

export interface LogoProps extends Omit<AvatarProps, 'src' | 'alt'> {}

export const Logo = memo(function Logo(props: LogoProps) {
  const intl = useIntl()
  return (
    <Avatar
      {...props}
      src={LOGO_URL}
      alt={intl.formatMessage({ defaultMessage: '亿文' })}
    />
  )
})

// eslint-disable-next-line react-refresh/only-export-components
export { LOGO_URL }
