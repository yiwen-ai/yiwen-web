import { css, useTheme } from '@emotion/react'
import { Avatar, textEllipsis } from '@yiwen-ai/component'
import {
  useAuth,
  type CreationOutput,
  type PublicationOutput,
} from '@yiwen-ai/store'

export function CreatedBy({
  item,
  ...props
}: {
  item: CreationOutput | PublicationOutput
} & React.HTMLAttributes<HTMLDivElement>) {
  const theme = useTheme()
  const lang = useAuth().user?.locale

  const creatorName = item?.creator_info?.name || item?.group_info?.name
  const creatorAvatar = item?.creator_info?.picture || item?.group_info?.logo

  return (
    <div
      {...props}
      css={css`
        display: inline-flex;
        align-items: center;
        color: ${theme.color.body.secondary};
      `}
    >
      {creatorName && (
        <>
          {creatorAvatar && (
            <Avatar
              src={creatorAvatar}
              alt={creatorName}
              size='small'
              css={css`
                margin-right: 12px;
              `}
            />
          )}
          <span css={textEllipsis}>{creatorName}</span>
          <i
            css={css`
              margin: 0 8px;
            `}
          >
            ·
          </i>
        </>
      )}
      <span>{new Date(item.created_at).toLocaleDateString(lang)}</span>
    </div>
  )
}
