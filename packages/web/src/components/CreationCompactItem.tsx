import { css, useTheme } from '@emotion/react'
import {
  Icon,
  Menu,
  MenuItem,
  Spinner,
  textEllipsis,
} from '@yiwen-ai/component'
import { type CreationOutput } from '@yiwen-ai/store'
import { useCallback } from 'react'
import { useIntl } from 'react-intl'
import { IconMoreAnchor } from './IconMoreAnchor'

export default function CreationCompactItem({
  item,
  hasWritePermission,
  isRestoring,
  isDeleting,
  onRestore,
  onDelete,
}: {
  item: CreationOutput
  hasWritePermission: boolean
  isRestoring: boolean
  isDeleting: boolean
  onRestore: (item: CreationOutput) => void
  onDelete: (item: CreationOutput) => void
}) {
  const intl = useIntl()
  const theme = useTheme()
  const disabled = isRestoring || isDeleting
  const handleRestore = useCallback(() => onRestore(item), [item, onRestore])
  const handleDelete = useCallback(() => onDelete(item), [item, onDelete])

  return (
    <div
      css={css`
        padding: 24px 0;
        border-bottom: 1px solid ${theme.color.divider.primary};
      `}
    >
      <div
        css={css`
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        `}
      >
        <div css={textEllipsis}>{item.title}</div>
        {hasWritePermission && (
          <Menu bringFocusBack={false} anchor={IconMoreAnchor}>
            <MenuItem
              before={
                isRestoring ? (
                  <Spinner size={12} />
                ) : (
                  <Icon name='recoveryconvert' size='small' />
                )
              }
              label={intl.formatMessage({ defaultMessage: '恢复' })}
              disabled={disabled}
              onClick={handleRestore}
              closeOnClick={3000}
            />
            <MenuItem
              before={
                isDeleting ? (
                  <Spinner size={12} />
                ) : (
                  <Icon name='delete' size='small' />
                )
              }
              label={intl.formatMessage({ defaultMessage: '彻底删除' })}
              danger={true}
              disabled={disabled}
              onClick={handleDelete}
              closeOnClick={3000}
            />
          </Menu>
        )}
      </div>
      <div
        css={css`
          margin-top: 4px;
          ${theme.typography.tooltip}
          color: ${theme.color.body.secondary};
        `}
      >
        {intl.formatMessage(
          { defaultMessage: '归档于 {date}' },
          { date: new Date(item.updated_at).toLocaleDateString() }
        )}
      </div>
    </div>
  )
}
