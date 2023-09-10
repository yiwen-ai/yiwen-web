import { css } from '@emotion/react'

export default function OrderedList({
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      css={css`
        display: grid;
        gap: 12px 24px;
      `}
    />
  )
}
