import { css } from '@emotion/react'

export default function PlainArticle(props: React.HTMLAttributes<HTMLElement>) {
  return (
    <article
      {...props}
      css={(theme) => css`
        > :not(style) + {
          * {
            margin-top: 16px;
          }
          h3 {
            margin-top: 24px;
          }
        }
        h3 {
          ${theme.typography.bodyBold}
          color: ${theme.palette.primaryNormal};
        }
        ol ol {
          list-style-type: lower-alpha;
        }
      `}
    />
  )
}
