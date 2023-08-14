import { EDIT_CREATION_PATH } from '#/App'
import { css, useTheme } from '@emotion/react'
import {
  Button,
  Icon,
  Menu,
  MenuItem,
  Spinner,
  textEllipsis,
} from '@yiwen-ai/component'
import { CreationStatus, type CreationOutput } from '@yiwen-ai/store'
import { mergeClickProps, stopPropagation, useClick } from '@yiwen-ai/util'
import { useCallback, type HTMLAttributes } from 'react'
import { useIntl } from 'react-intl'
import { generatePath, useNavigate } from 'react-router-dom'
import { Xid } from 'xid-ts'
import CreationItemStatus from './CreationItemStatus'
import { IconMoreAnchor } from './IconMoreAnchor'

export default function CreationItem({
  item,
  isReleasing,
  isArchiving,
  onClick,
  onRelease,
  onArchive,
}: {
  item: CreationOutput
  isReleasing: boolean
  isArchiving: boolean
  onClick: (item: CreationOutput) => void
  onRelease: (item: CreationOutput) => void
  onArchive: (item: CreationOutput) => void
}) {
  const intl = useIntl()
  const theme = useTheme()
  const navigate = useNavigate()
  const disabled = isReleasing || isArchiving
  const handleClickProps = useClick<HTMLAttributes<HTMLDivElement>>({}, () =>
    onClick(item)
  )
  const handleEdit = useCallback(() => {
    navigate({
      pathname: generatePath(EDIT_CREATION_PATH, {
        cid: Xid.fromValue(item.id).toString(),
      }),
      search: new URLSearchParams({
        gid: Xid.fromValue(item.gid).toString(),
      }).toString(),
    })
  }, [item.gid, item.id, navigate])
  const handleRelease = useCallback(() => onRelease(item), [item, onRelease])
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
          margin-top: 12px;
          display: flex;
          align-items: center;
          gap: 24px;
        `}
      >
        {item.status === CreationStatus.Draft ? (
          <Button
            color='primary'
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
