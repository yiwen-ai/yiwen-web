import { css, useTheme } from '@emotion/react'
import { Avatar } from '@yiwen-ai/component'
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

  return (
    <div
      {...props}
      css={css`
        display: inline-flex;
        align-items: center;
        color: ${theme.color.body.secondary};
        gap: 8px;
      `}
    >
      {item.creator_info && (
        <>
          <Avatar
            src={item.creator_info.picture}
            name={item.creator_info.name}
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
