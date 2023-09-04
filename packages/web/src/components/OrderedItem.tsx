import { css, useTheme } from '@emotion/react'

export default function OrderedItem({
  index,
  primary,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  index: number
  primary?: boolean
}) {
  const theme = useTheme()

  return (
    <div
      {...props}
      css={css`
        padding: 2px 12px;
        box-sizing: border-box;
        border-radius: 8px;
        display: flex;
        align-items: flex-start;
        gap: 6px;
        cursor: pointer;
        :hover {
          background: ${theme.color.menu.item.hover.background};
        }
      `}
    >
      <span
        css={css`
          font-weight: ${primary ? 600 : 400};
          color: ${primary
            ? theme.color.link.normal
            : theme.color.body.secondary};
        `}
      >
        {index + 1 + '.'}
      </span>
      <span
        css={css`
          overflow-wrap: break-word;
        `}
      >
        {props.children}
      </span>
    </div>
  )
}
