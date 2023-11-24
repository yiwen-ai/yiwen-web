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
import { CreationStatus, isRTL, type CreationOutput } from '@yiwen-ai/store'
import { checkNarrow, preventDefaultStopPropagation } from '@yiwen-ai/util'
import { useCallback } from 'react'
import { useIntl } from 'react-intl'
import CreationItemStatus from './CreationItemStatus'
import CreationLink from './CreationLink'
import { renderIconMoreAnchor } from './IconMoreAnchor'

export default function CreationItem({
  item,
  hasWritePermission,
  isEditing,
  isReleasing,
  isArchiving,
  onClick,
  onSetting,
  onRelease,
  onArchive,
}: {
  item: CreationOutput
  hasWritePermission: boolean
  isEditing: boolean
  isReleasing: boolean
  isArchiving: boolean
  onClick: (item: CreationOutput) => void
  onSetting: (item: CreationOutput) => void
  onRelease: (item: CreationOutput) => void
  onArchive: (item: CreationOutput) => void
}) {
  const intl = useIntl()
  const theme = useTheme()
  const disabled = isEditing || isReleasing || isArchiving
  const handleClick = useCallback(() => onClick(item), [item, onClick])
  const handleSetting = useCallback(() => onSetting(item), [item, onSetting])
  const handleRelease = useCallback(() => onRelease(item), [item, onRelease])
  const handleArchive = useCallback(() => onArchive(item), [item, onArchive])
  const maxSumLength = checkNarrow() ? 80 : 140

  return (
    <CreationLink
      gid={item.gid}
      cid={item.id}
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
          {item.summary.length < maxSumLength
            ? item.summary
            : item.summary.slice(0, maxSumLength) + '...'}
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
          {item.status === CreationStatus.Draft ||
          item.status === CreationStatus.Review ? (
            <Button
              size='small'
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
          <Button
            size='small'
            color='secondary'
            variant='text'
            disabled={disabled}
            onClick={handleSetting}
          >
            <Icon name='settings' size='small' />
            <span>{intl.formatMessage({ defaultMessage: '设置' })}</span>
          </Button>
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
        </div>
      )}
    </CreationLink>
  )
}
