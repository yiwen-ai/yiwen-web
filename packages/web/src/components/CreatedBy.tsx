import { css, useTheme } from '@emotion/react'
import { Avatar } from '@yiwen-ai/component'
import {
  useAuth,
  type CreationOutput,
  type PublicationOutput,
} from '@yiwen-ai/store'

export default function CreatedBy({
  item,
  ...props
}: {
  item: CreationOutput | PublicationOutput
} & React.HTMLAttributes<HTMLDivElement>) {
  const theme = useTheme()
  const lang = useAuth().user?.locale

  const creatorName = item.creator_info?.name || item.group_info?.name
  const creatorAvatar = item.creator_info?.picture || item.group_info?.logo

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
        <>
          <Avatar
            src={creatorAvatar}
            name={creatorName}
            size='small'
            css={css`
              gap: 12px;
            `}
          />
          <i>·</i>
        </>
      )}
      <span>{new Date(item.created_at).toLocaleDateString(lang)}</span>
    </div>
  )
}
