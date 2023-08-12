import { css } from '@emotion/react'
import { Icon } from '@yiwen-ai/component'
import { type AnchorProps } from '@yiwen-ai/util'

export function IconMoreAnchor(props: AnchorProps) {
  return (
    <Icon
      name='more'
      {...props}
      css={css`
        cursor: pointer;
      `}
    />
  )
}
