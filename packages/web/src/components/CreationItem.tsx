import { css, useTheme } from '@emotion/react'
import {
  Button,
  Icon,
  Menu,
  MenuItem,
  Spinner,
  textEllipsis,
} from '@yiwen-ai/component'
import { CreationStatus, isRTL, type CreationOutput } from '@yiwen-ai/store'
import { preventDefaultStopPropagation } from '@yiwen-ai/util'
import { useCallback } from 'react'
import { useIntl } from 'react-intl'
import CreationItemStatus from './CreationItemStatus'
import CreationLink from './CreationLink'
import { IconMoreAnchor } from './IconMoreAnchor'

export default function CreationItem({
  item,
  hasWritePermission,
  isEditing,
  isReleasing,
  isArchiving,
  onClick,
  onEdit,
  onRelease,
  onArchive,
}: {
  item: CreationOutput
  hasWritePermission: boolean
  isEditing: boolean
  isReleasing: boolean
  isArchiving: boolean
  onClick: (item: CreationOutput) => void
  onEdit: (item: CreationOutput) => void
  onRelease: (item: CreationOutput) => void
  onArchive: (item: CreationOutput) => void
}) {
  const intl = useIntl()
  const theme = useTheme()
  const disabled = isEditing || isReleasing || isArchiving
  const hasReleases = item.version >= 2
  const handleClick = useCallback(() => onClick(item), [item, onClick])
  const handleEdit = useCallback(() => onEdit(item), [item, onEdit])
  const handleRelease = useCallback(() => onRelease(item), [item, onRelease])
  const handleArchive = useCallback(() => onArchive(item), [item, onArchive])

  return (
    <CreationLink
      gid={item.gid}
      cid={item.id}
      onClick={handleClick}
      css={css`
        display: block;
        padding: 24px;
        border: 1px solid ${theme.color.divider.default};
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
        {hasWritePermission && item.status === CreationStatus.Draft ? (
          <Button
            color='primary'
            variant='outlined'
            disabled={disabled}
            onClick={handleRelease}
          >
            {isReleasing && <Spinner size={12} />}
            <span>
              {intl.formatMessage({ defaultMessage: '投稿，在发布栏翻译' })}
            </span>
          </Button>
        ) : (
          <CreationItemStatus status={item.status} />
        )}
        {hasWritePermission && (
          <Button
            color='secondary'
            variant='text'
            disabled={disabled}
            onClick={handleEdit}
          >
            {isEditing ? (
              <Spinner size={12} />
            ) : hasReleases ? (
              <Icon name='refresh' size='small' />
            ) : (
              <Icon name='edit' size='small' />
            )}
            <span>
              {hasReleases
                ? intl.formatMessage({ defaultMessage: '更新版本' })
                : intl.formatMessage({ defaultMessage: '编辑' })}
            </span>
          </Button>
        )}
        {hasWritePermission && (
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
    </CreationLink>
  )
}
