import { Global, css, useTheme } from '@emotion/react'

export function GlobalStyles() {
  const theme = useTheme()

  return (
    <Global
      styles={css`
        body {
          margin: 0;
          background-color: ${theme.color.body.background};
          color: ${theme.color.body.primary};
          -webkit-font-smoothing: antialiased;
          font-family: ${theme.font.body};
          ${theme.typography.body}
        }

        h1,
        h2,
        h3 {
          margin: 0;
          ${theme.typography.body}
        }

        ul,
        ol {
          margin: 0;
          padding: 0;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        button {
          padding: 0;
          display: inline-flex;
          border: none;
          background: none;
          color: inherit;
          font-size: inherit;
          line-height: inherit;
          cursor: pointer;
        }

        input,
        textarea {
          padding: 0;
        }

        input[type='search'] {
          ::-webkit-search-decoration,
          ::-webkit-search-cancel-button,
          ::-webkit-search-results-button,
          ::-webkit-search-results-decoration {
            display: none;
          }
        }
      `}
    />
  )
}
