import { memo } from 'react'

export interface FooterProps extends React.HTMLAttributes<HTMLElement> {}

export const Footer = memo(function Footer(props: FooterProps) {
  return <footer {...props}>©️ 2023 Yiwen AI Limited</footer>
})
