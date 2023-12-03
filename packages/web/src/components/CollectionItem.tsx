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
  CollectionStatus,
  getCollectionInfo,
  isRTL,
  type CollectionOutput,
} from '@yiwen-ai/store'
import { checkNarrow, preventDefaultStopPropagation } from '@yiwen-ai/util'
import { useCallback, useMemo } from 'react'
import { useIntl } from 'react-intl'
import CollectionItemStatus from './CollectionItemStatus'
import CollectionLink from './CollectionLink'
import { renderIconMoreAnchor } from './IconMoreAnchor'

export default function CollectionItem({
  item,
  isNarrow,
  hasWritePermission,
  isPublishing,
  isArchiving,
  onClick,
  onPublish,
  onSetting,
  onArchive,
}: {
  item: CollectionOutput
  isNarrow: boolean
  hasWritePermission?: boolean
  isPublishing?: boolean
  isArchiving?: boolean
  onClick: (item: CollectionOutput) => void
  onPublish?: (item: CollectionOutput) => void
  onSetting?: (item: CollectionOutput) => void
  onArchive?: (item: CollectionOutput) => void
}) {
  const intl = useIntl()
  const theme = useTheme()
  const disabled = isArchiving || isPublishing
  const handleClick = useCallback(() => onClick(item), [item, onClick])
  const handleSetting = useCallback(
    () => onSetting && onSetting(item),
    [item, onSetting]
  )
  const handlePublish = useCallback(
    () => onPublish && onPublish(item),
    [item, onPublish]
  )
  const handleArchive = useCallback(
    () => onArchive && onArchive(item),
    [item, onArchive]
  )

  const [language, info] = useMemo(() => {
    if (!item) {
      return ['', undefined]
    }

    return getCollectionInfo(item)
  }, [item])

  const maxSumLength = checkNarrow() ? 60 : 120
  const dir = isRTL(language) ? 'rtl' : undefined

  return (
    info && (
      <CollectionLink
        gid={item.gid}
        cid={item.id}
        onClick={handleClick}
        css={css`
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          justify-content: flex-start;
          padding: 16px 24px;
          border-radius: 12px;
          cursor: pointer;
          :hover {
            box-shadow: ${theme.effect.cardHover};
          }
          @media (max-width: ${BREAKPOINT.small}px) {
            padding: 12px 16px;
            border-radius: 8px;
          }
        `}
      >
        <img
          src={
            (item.cover as string) || 'https://cdn.yiwen.pub/yiwen.cover.png'
          }
          alt='Cover'
          css={css`
            display: block;
            width: 120px;
            min-height: 160px;
            max-height: 200px;
            border-radius: 4px;
            object-fit: contain;
            background-color: ${theme.color.divider.secondary};
            box-shadow: ${theme.effect.card};
            @media (max-width: ${BREAKPOINT.small}px) {
              width: 100px;
              min-height: 130px;
              max-height: 160px;
            }
          `}
        ></img>
        <div
          css={css`
            margin-left: 16px;
            width: 612px;
          `}
        >
          <div
            dir={dir}
            css={css`
              ${textEllipsis}
              ${isNarrow ? theme.typography.body : theme.typography.h2}
            `}
          >
            {info.title}
          </div>
          {(info.authors || info.keywords) && (
            <div
              dir={dir}
              css={css`
                display: flex;
                align-items: center;
                gap: 8px;
                margin-top: 8px;
                flex-wrap: wrap;
                flex-direction: row;
              `}
            >
              {info.authors?.map((author) => (
                <Button
                  key={author}
                  color='primary'
                  size='medium'
                  variant='text'
                  readOnly={true}
                >
                  {author}
                </Button>
              ))}
              {info.keywords?.map((keyword) => (
                <Button
                  key={keyword}
                  color='secondary'
                  size='small'
                  readOnly={true}
                >
                  {keyword}
                </Button>
              ))}
            </div>
          )}

          {info.summary && (
            <div
              dir={dir}
              css={css`
                margin-top: 8px;
                ${isNarrow && theme.typography.tooltip}
              `}
            >
              {info.summary.length < maxSumLength
                ? info.summary
                : info.summary.slice(0, maxSumLength) + '...'}
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
              <CollectionItemStatus status={item.status} />
              {(item.status === CollectionStatus.Private ||
                item.status === CollectionStatus.Internal ||
                item.status === CollectionStatus.Public) && (
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
              )}
              {(item.status === CollectionStatus.Private ||
                item.status === CollectionStatus.Internal) && (
                <Button
                  size='small'
                  color='primary'
                  variant='outlined'
                  disabled={disabled}
                  onClick={handlePublish}
                >
                  {isPublishing && <Spinner size={12} />}
                  <span>
                    {intl.formatMessage({ defaultMessage: '公开发布' })}
                  </span>
                </Button>
              )}
              {(item.status === CollectionStatus.Private ||
                item.status === CollectionStatus.Internal) && (
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
        </div>
      </CollectionLink>
    )
  )
}
