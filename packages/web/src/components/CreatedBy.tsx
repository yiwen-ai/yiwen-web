import { css, useTheme } from '@emotion/react'
import { Avatar } from '@yiwen-ai/component'
import { useAuth, type GroupInfo } from '@yiwen-ai/store'

export default function CreatedBy({
  item,
  timestamp,
  ...props
}: {
  item: GroupInfo
  timestamp: number
} & React.HTMLAttributes<HTMLDivElement>) {
  const theme = useTheme()
  const lang = useAuth().user?.locale

  const creatorName = item.name
  const creatorAvatar = item.logo
  const creatorCn = item.cn

  return (
    <div
      {...props}
      css={css`
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: ${theme.color.body.secondary};
      `}
    >
      {creatorName && (
        <Avatar
          src={creatorAvatar}
          name={creatorName}
          cn={creatorCn}
          size='small'
        />
      )}
      {timestamp > 0 && (
        <>
          <i>·</i>
          <span>{new Date(timestamp).toLocaleDateString(lang)}</span>
        </>
      )}
    </div>
  )
}
