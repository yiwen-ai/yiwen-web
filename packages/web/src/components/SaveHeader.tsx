import { SetHeaderProps } from '#/App'
import { css } from '@emotion/react'

export default function SaveHeader({
  isLoading,
  ...props
}: React.PropsWithChildren<{
  isLoading: boolean
}>) {
  return isLoading ? null : (
    <SetHeaderProps>
      <div
        css={css`
          flex: 1;
          margin: 0 36px;
          display: flex;
          justify-content: flex-end;
          gap: 36px;
        `}
      >
        {props.children}
      </div>
    </SetHeaderProps>
  )
}
