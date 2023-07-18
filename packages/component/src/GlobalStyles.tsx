import { Global, css, useTheme } from '@emotion/react'

export function GlobalStyles() {
  const theme = useTheme()

  return (
    <Global
      styles={css`
        body {
          margin: 0;
          background-color: ${theme.color.body.background};
          color: ${theme.color.body.text};
          font-family: ${theme.font.body};
          ${theme.typography.body}
        }

        h1,
        h2,
        h3 {
          margin: 0;
          ${theme.typography.body}
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

        button {
          padding: 0;
        }
      `}
    />
  )
}
