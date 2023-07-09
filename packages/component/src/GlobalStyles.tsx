import { Global, css, useTheme } from '@emotion/react'

export function GlobalStyles() {
  const theme = useTheme()

  return (
    <Global
      styles={css`
        body {
          margin: 0;
          background-color: ${theme.color.background};
          color: ${theme.color.text};
          font-family: ${theme.font.primary};
          ${theme.typography.bodyText}
        }

        h1,
        h2,
        h3 {
          margin: 0;
        }

        ul {
          margin: 0;
          padding: 0;
        }

        li {
          list-style: none;
        }

        a {
          color: inherit;
          text-decoration: none;
        }
      `}
    />
  )
}
