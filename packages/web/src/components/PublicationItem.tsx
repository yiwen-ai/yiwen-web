import { BREAKPOINT } from '#/shared'
import { css, useTheme } from '@emotion/react'
import {
  Button,
  Icon,
  Menu,
  MenuItem,
  Spinner,
  textEllipsis,
} from '@yiwen-ai/component'
import {
  PublicationStatus,
  isRTL,
  type PublicationOutput,
} from '@yiwen-ai/store'
import { preventDefaultStopPropagation } from '@yiwen-ai/util'
import { useCallback } from 'react'
import { useIntl } from 'react-intl'
import { renderIconMoreAnchor } from './IconMoreAnchor'
import PublicationItemStatus from './PublicationItemStatus'
import PublicationLink from './PublicationLink'

export default function PublicationItem({
  item,
  hasWritePermission,
  isPublishing,
  isEditing,
  isArchiving,
  onClick,
  onPublish,
  onEdit,
  onArchive,
}: {
  item: PublicationOutput
  hasWritePermission: boolean
  isPublishing?: boolean
  isEditing?: boolean
  isArchiving?: boolean
  onClick?: (item: PublicationOutput) => void
  onPublish?: (item: PublicationOutput) => void
  onEdit?: (item: PublicationOutput) => void
  onArchive?: (item: PublicationOutput) => void
}) {
  const intl = useIntl()
  const theme = useTheme()
  const disabled = isPublishing || isEditing || isArchiving
  const handleClick = useCallback(
    () => onClick && onClick(item),
    [item, onClick]
  )
  const handleEdit = useCallback(() => onEdit && onEdit(item), [item, onEdit])
  const handlePublish = useCallback(
    () => onPublish && onPublish(item),
    [item, onPublish]
  )
  const handleArchive = useCallback(
    () => onArchive && onArchive(item),
    [item, onArchive]
  )

  return (
    <PublicationLink
      gid={item.gid}
      cid={item.cid}
      language={item.language}
      version={item.version}
      onClick={handleClick}
      css={css`
        display: block;
        padding: 16px 24px;
        border-radius: 12px;
        cursor: pointer;
        box-shadow: ${theme.effect.card};
        :hover {
          box-shadow: ${theme.effect.cardHover};
        }
        @media (max-width: ${BREAKPOINT.small}px) {
          padding: 12px 16px;
          border-radius: 8px;
        }
      `}
    >
      <div
        dir={isRTL(item.language) ? 'rtl' : undefined}
        css={css`
          ${textEllipsis}
          ${theme.typography.h2}
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
          {item.summary.length < 140
            ? item.summary
            : item.summary.slice(0, 140) + '...'}
        </div>
      )}
      {hasWritePermission && (
        <div
          role='none'
          onClick={preventDefaultStopPropagation}
          css={css`
            width: fit-content;
            margin-top: 12px;
            display: flex;
            align-items: center;
            gap: 24px;
            @media (max-width: ${BREAKPOINT.small}px) {
              display: none;
            }
          `}
        >
          <PublicationItemStatus status={item.status} />
          {item.status === PublicationStatus.Review && (
            <Button
              size='small'
              color='secondary'
              variant='text'
              disabled={disabled}
              onClick={handleEdit}
            >
              {isEditing ? (
                <Spinner size={12} />
              ) : (
                <Icon name='edit' size='small' />
              )}
              <span>{intl.formatMessage({ defaultMessage: '修正' })}</span>
            </Button>
          )}
          {item.status === PublicationStatus.Approved && (
            <Button
              size='small'
              color='primary'
              variant='outlined'
              disabled={disabled}
              onClick={handlePublish}
            >
              {isPublishing && <Spinner size={12} />}
              <span>{intl.formatMessage({ defaultMessage: '公开发布' })}</span>
            </Button>
          )}
          {(item.status === PublicationStatus.Review ||
            item.status === PublicationStatus.Approved) && (
            <Menu bringFocusBack={false} anchor={renderIconMoreAnchor}>
              <MenuItem
                before={
                  isArchiving ? (
                    <Spinner size={12} />
                  ) : (
                    <Icon name='archive' size='small' />
                  )
                }
                label={intl.formatMessage({ defaultMessage: '归档' })}
                disabled={disabled}
                onClick={handleArchive}
                closeOnClick={3000}
              />
            </Menu>
          )}
        </div>
      )}
    </PublicationLink>
  )
}
