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
import { IconMoreAnchor } from './IconMoreAnchor'
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
  isPublishing: boolean
  isEditing: boolean
  isArchiving: boolean
  onClick: (item: PublicationOutput) => void
  onPublish: (item: PublicationOutput) => void
  onEdit: (item: PublicationOutput) => void
  onArchive: (item: PublicationOutput) => void
}) {
  const intl = useIntl()
  const theme = useTheme()
  const disabled = isPublishing || isEditing || isArchiving
  const handleClick = useCallback(() => onClick(item), [item, onClick])
  const handleEdit = useCallback(() => onEdit(item), [item, onEdit])
  const handlePublish = useCallback(() => onPublish(item), [item, onPublish])
  const handleArchive = useCallback(() => onArchive(item), [item, onArchive])

  return (
    <PublicationLink
      gid={item.gid}
      cid={item.cid}
      language={item.language}
      version={item.version}
      onClick={handleClick}
      css={css`
        display: block;
        padding: 24px;
        border: 1px solid ${theme.color.divider.primary};
        border-radius: 12px;
        cursor: pointer;
        :hover {
          border-color: ${theme.color.button.primary.outlined.border};
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
          {item.summary}
        </div>
      )}
      <div
        role='none'
        onClick={preventDefaultStopPropagation}
        css={css`
          width: fit-content;
          margin-top: 12px;
          display: flex;
          align-items: center;
          gap: 24px;
        `}
      >
        <PublicationItemStatus status={item.status} />
        {hasWritePermission && item.status === PublicationStatus.Review && (
          <Button
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
            <span>{intl.formatMessage({ defaultMessage: '修订' })}</span>
          </Button>
        )}
        {hasWritePermission && item.status === PublicationStatus.Approved && (
          <Button
            color='primary'
            variant='outlined'
            disabled={disabled}
            onClick={handlePublish}
          >
            {isPublishing && <Spinner size={12} />}
            <span>{intl.formatMessage({ defaultMessage: '公开发布' })}</span>
          </Button>
        )}
        {hasWritePermission &&
          (item.status === PublicationStatus.Review ||
            item.status === PublicationStatus.Approved) && (
            <Menu bringFocusBack={false} anchor={IconMoreAnchor}>
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
    </PublicationLink>
  )
}
