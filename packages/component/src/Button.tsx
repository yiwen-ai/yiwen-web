import { css } from '@emotion/react'
import { memo } from 'react'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // TODO: implement
  // primary?: boolean
  // size?: 'small' | 'medium' | 'large'
}

export const Button = memo(function Button({ ...props }: ButtonProps) {
  return (
    <button
      type="button"
      {...props}
      css={css`
        background: #fff;
      `}
    >
      {props.children}
    </button>
  )
})
