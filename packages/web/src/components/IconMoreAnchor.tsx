import { IconButton } from '@yiwen-ai/component'
import { type AnchorProps } from '@yiwen-ai/util'

export function renderIconMoreAnchor(props: AnchorProps) {
  return (
    <IconButton
      iconName='more'
      shape='rounded'
      size='medium'
      iconSize='medium'
      {...props}
    />
  )
}
