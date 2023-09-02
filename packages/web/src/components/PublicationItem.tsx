import { css, useTheme } from '@emotion/react'
import {
  Button,
  Icon,
  Menu,
  MenuItem,
  Spinner,
  textEllipsis,
} from '@yiwen-ai/component'
import { PublicationStatus, type PublicationOutput } from '@yiwen-ai/store'
import { mergeClickProps, stopPropagation, useClick } from '@yiwen-ai/util'
import { useCallback, type HTMLAttributes } from 'react'
import { useIntl } from 'react-intl'
import { IconMoreAnchor } from './IconMoreAnchor'
import PublicationItemStatus from './PublicationItemStatus'

export default function PublicationItem({
  item,
  isPublishing,
  isEditing,
  isArchiving,
  onClick,
  onPublish,
  onEdit,
  onArchive,
}: {
  item: PublicationOutput
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
  const handleClickProps = useClick<HTMLAttributes<HTMLDivElement>>({}, () =>
    onClick(item)
  )
  const handleEdit = useCallback(() => onEdit(item), [item, onEdit])
  const handlePublish = useCallback(() => onPublish(item), [item, onPublish])
  const handleArchive = useCallback(() => onArchive(item), [item, onArchive])

  return (
    <div
      {...handleClickProps}
      css={css`
        padding: 32px 40px;
        border: 1px solid ${theme.color.divider.primary};
        border-radius: 12px;
        cursor: pointer;
        :hover {
          border-color: ${theme.color.button.primary.outlined.border};
        }
      `}
    >
      <div
        css={css`
          ${textEllipsis}
          ${theme.typography.h2}
        `}
      >
        {item.title}
      </div>
      {item.summary && (
        <div
          css={css`
            margin-top: 12px;
          `}
        >
          {item.summary}
        </div>
      )}
      <div
        role='none'
        {...mergeClickProps({}, stopPropagation)}
        css={css`
          width: fit-content;
          margin-top: 12px;
          display: flex;
          align-items: center;
          gap: 24px;
        `}
      >
        <PublicationItemStatus status={item.status} />
        {item.status === PublicationStatus.Review && (
          <Button
            color='secondary'
            variant='text'
            size='small'
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
        {item.status === PublicationStatus.Approved && (
          <Button
            color='primary'
            variant='outlined'
            size='small'
            disabled={disabled}
            onClick={handlePublish}
          >
            {isPublishing && <Spinner size={12} />}
            <span>{intl.formatMessage({ defaultMessage: '公开发布' })}</span>
          </Button>
        )}
        <Menu bringFocusBack={false} anchor={IconMoreAnchor}>
          <MenuItem
            before={
              isArchiving ? (
                <Spinner size={12} />
              ) : (
                <Icon name='archive' size='small' />
              )
            }
            label={intl.formatMessage({ defaultMessage: '归档文章' })}
            disabled={disabled}
            onClick={handleArchive}
            closeOnClick={3000}
          />
        </Menu>
      </div>
    </div>
  )
}
