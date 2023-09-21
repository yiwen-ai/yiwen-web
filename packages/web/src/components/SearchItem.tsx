import { css, useTheme } from '@emotion/react'
import { Avatar, textEllipsis } from '@yiwen-ai/component'
import { isRTL, type SearchDocument } from '@yiwen-ai/store'
import { useCallback } from 'react'
import PublicationLink from './PublicationLink'

export default function SearchItem({
  item,
  onClick,
}: {
  item: SearchDocument
  onClick: (item: SearchDocument) => void
}) {
  const theme = useTheme()
  const groupLogo = item.group?.logo || item.group?.owner?.picture
  const groupName = item.group?.name

  const handleClick = useCallback(() => {
    onClick(item)
  }, [item, onClick])

  return (
    <PublicationLink
      gid={item.gid}
      cid={item.cid}
      language={item.language}
      version={item.version}
      onClick={handleClick}
      css={css`
        display: block;
        padding: 16px 0;
        border-bottom: 1px solid ${theme.color.divider.primary};
        cursor: pointer;
      `}
    >
      <div
        dir={isRTL(item.language) ? 'rtl' : undefined}
        css={css`
          ${theme.typography.h2}
          color: ${theme.palette.primaryNormal};
        `}
      >
        {item.title}
      </div>
      {item.summary && (
        <div
          dir={isRTL(item.language) ? 'rtl' : undefined}
          css={css`
            margin-top: 12px;
          `}
        >
          {item.summary}
        </div>
      )}
      {groupName && (
        <div
          css={css`
            margin-top: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
            color: ${theme.color.body.secondary};
          `}
        >
          {groupLogo && <Avatar src={groupLogo} alt={groupName} size='small' />}
          <div
            css={css`
              ${textEllipsis}
            `}
          >
            {groupName}
          </div>
        </div>
      )}
    </PublicationLink>
  )
}
