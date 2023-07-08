import { css } from '@emotion/react'

export default function Index() {
  return (
    <div
      css={css`
        display: flex;
        align-items: center;
        justify-content: center;
      `}
    >
      {'Hello, world!'}
    </div>
  )
}
