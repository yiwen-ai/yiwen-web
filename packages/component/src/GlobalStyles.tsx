import { Global, css, useTheme } from '@emotion/react'

export function GlobalStyles() {
  const theme = useTheme()

  return (
    <Global
      styles={css`
        body {
          margin: 0;
          background-color: ${theme.colors.background};
          color: ${theme.colors.text};
        }
      `}
    />
  )
}
