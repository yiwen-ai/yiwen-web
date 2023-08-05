import { css, useTheme } from '@emotion/react'
import { Button, Icon, Menu, MenuItem, Spinner } from '@yiwen-ai/component'
import { CreationStatus, type CreationOutput } from '@yiwen-ai/store'
import { useCallback } from 'react'
import { useIntl } from 'react-intl'
import CreationItemStatus from './CreationItemStatus'

export default function CreationItem({
  item,
  isReleasing,
  isArchiving,
  onRelease,
  onArchive,
}: {
  item: CreationOutput
  isReleasing: boolean
  isArchiving: boolean
  onRelease: (item: CreationOutput) => void
  onArchive: (item: CreationOutput) => void
}) {
  const intl = useIntl()
  const theme = useTheme()
  const disabled = isReleasing || isArchiving
  const handleEdit = useCallback(() => {
    // TODO: edit creation
  }, [])
  const handleRelease = useCallback(() => onRelease(item), [item, onRelease])
  const handleArchive = useCallback(() => onArchive(item), [item, onArchive])

  return (
    <div
      css={css`
        padding: 32px 40px;
        border: 1px solid ${theme.color.divider.primary};
        border-radius: 12px;
      `}
    >
      <div
        css={css`
          ${theme.typography.h3}
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
        css={css`
          margin-top: 12px;
          display: flex;
          align-items: center;
          gap: 24px;
        `}
      >
        {item.status === CreationStatus.Draft ? (
          <Button
            variant='outlined'
            size='small'
            disabled={disabled}
            onClick={handleRelease}
          >
            {isReleasing && <Spinner size={12} />}
            <span>{intl.formatMessage({ defaultMessage: '发布' })}</span>
          </Button>
        ) : (
          <CreationItemStatus status={item.status} />
        )}
        <Button
          color='secondary'
          variant='text'
          size='small'
          disabled={disabled}
          onClick={handleEdit}
        >
          <Icon name='edit' size='small' />
          <span>{intl.formatMessage({ defaultMessage: '编辑' })}</span>
        </Button>
        <Menu
          bringFocusBack={false}
          anchor={(props) => (
            <Icon
              name='more'
              {...props}
              css={css`
                cursor: pointer;
              `}
            />
          )}
        >
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
