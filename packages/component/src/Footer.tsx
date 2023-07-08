import { memo } from 'react'

export interface FooterProps extends React.HTMLAttributes<HTMLElement> {}

export const Footer = memo(function Footer(props: FooterProps) {
  return <footer {...props}>©️ 亿文 2023</footer>
})
