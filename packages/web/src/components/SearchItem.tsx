import { css, useTheme } from '@emotion/react'
import { ObjectKind, isRTL, type SearchDocument } from '@yiwen-ai/store'
import { useCallback } from 'react'
import { useIntl } from 'react-intl'
import CreatedBy from './CreatedBy'
import PublicationLink from './PublicationLink'

export default function SearchItem({
  item,
  onClick,
}: {
  item: SearchDocument
  onClick: (item: SearchDocument) => void
}) {
  const intl = useIntl()
  const theme = useTheme()

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
        border-bottom: 1px solid ${theme.color.divider.default};
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
        {item.kind === ObjectKind.Collection && (
          <label
            css={css`
              display: inline-block;
              padding: 1px 16px;
              margin-left: 16px;
              border-radius: 16px;
              color: ${theme.color.button.primary.contained.text};
              background-color: ${theme.color.alert.success.icon};
              ${theme.typography.body}
            `}
          >
            {intl.formatMessage({ defaultMessage: '合集' })}
          </label>
        )}
      </div>
      {item.summary && (
        <div
          dir={isRTL(item.language) ? 'rtl' : undefined}
          css={css`
            margin-top: 12px;
          `}
        >
          {item.summary.length < 140
            ? item.summary
            : item.summary.slice(0, 140) + '...'}
        </div>
      )}
      {item.group_info && (
        <CreatedBy
          item={item.group_info}
          timestamp={item.updated_at}
          css={css`
            margin-top: 8px;
          `}
        />
      )}
    </PublicationLink>
  )
}
