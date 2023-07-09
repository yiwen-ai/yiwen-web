import { useTheme, type Theme } from '@emotion/react'
import { memo, type ReactHTML } from 'react'

type TextType = keyof Theme['typography']

const DEFAULT_COMPONENT: Record<TextType, keyof ReactHTML> = {
  heading0: 'h1',
  heading1: 'h2',
  heading2: 'h3',
  bodyText: 'span',
  bodyTextBold: 'span',
  tooltip: 'span',
}

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  type?: TextType
  as?: keyof ReactHTML
}

export const Text = memo(function Text({
  type = 'bodyText',
  as: Component = DEFAULT_COMPONENT[type],
  ...props
}: TextProps) {
  const theme = useTheme()

  return (
    <Component {...props} css={theme.typography[type]}>
      {props.children}
    </Component>
  )
})
