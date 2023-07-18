import { css } from '@emotion/react'
import { Header } from '@yiwen-ai/component'

export default function Home() {
  return (
    <>
      <Header />
      <main
        css={css`
          display: flex;
          align-items: center;
          justify-content: center;
        `}
      >
        <div>{'Hello, world!'}</div>
      </main>
    </>
  )
}
