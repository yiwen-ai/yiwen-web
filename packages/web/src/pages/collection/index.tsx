import ErrorPlaceholder from '#/components/ErrorPlaceholder'
import { IconMoreAnchor } from '#/components/IconMoreAnchor'
import LargeDialog from '#/components/LargeDialog'
import LoadMore from '#/components/LoadMore'
import Loading from '#/components/Loading'
import Placeholder from '#/components/Placeholder'
import PublicationViewer from '#/components/PublicationViewer'
import { BREAKPOINT } from '#/shared'
import { useCollectionPage } from '#/store/useCollectionPage'
import { css, useTheme } from '@emotion/react'
import {
  Icon,
  Menu,
  MenuItem,
  Spinner,
  textEllipsis,
  useToast,
} from '@yiwen-ai/component'
import { type CollectionOutput } from '@yiwen-ai/store'
import { stopPropagation } from '@yiwen-ai/util'
import { useCallback } from 'react'
import { useIntl } from 'react-intl'
import { Xid } from 'xid-ts'

export default function CollectionPage() {
  const { renderToastContainer, pushToast } = useToast()

  const {
    isLoading,
    error,
    items,
    isLoadingMore,
    hasMore,
    loadMore,
    isRemoving,
    onView,
    onRemove,
    publicationViewer: {
      open: publicationViewerOpen,
      close: onPublicationViewerClose,
      ...publicationViewer
    },
  } = useCollectionPage(pushToast)

  return (
    <>
      {renderToastContainer()}
      <div
        css={css`
          padding: 60px 100px;
          @media (max-width: ${BREAKPOINT.small}px) {
            padding: 24px;
          }
        `}
      >
        {isLoading ? (
          <Loading />
        ) : error ? (
          <ErrorPlaceholder error={error} />
        ) : items.length === 0 ? (
          <Placeholder />
        ) : (
          <>
            {items.map((item) => (
              <CollectionItem
                key={Xid.fromValue(item.id).toString()}
                item={item}
                isRemoving={isRemoving(item)}
                onView={onView}
                onRemove={onRemove}
              />
            ))}
            <LoadMore
              isLoadingMore={isLoadingMore}
              hasMore={hasMore}
              onLoadMore={loadMore}
            />
          </>
        )}
      </div>
      {publicationViewerOpen && (
        <LargeDialog defaultOpen={true} onClose={onPublicationViewerClose}>
          <PublicationViewer responsive={true} {...publicationViewer} />
        </LargeDialog>
      )}
    </>
  )
}

function CollectionItem({
  item,
  isRemoving,
  onView,
  onRemove,
}: {
  item: CollectionOutput
  isRemoving: boolean
  onView: (item: CollectionOutput) => void
  onRemove: (item: CollectionOutput) => void
}) {
  const intl = useIntl()
  const theme = useTheme()

  const handleClick = useCallback(() => {
    onView(item)
  }, [item, onView])

  const handleKeyDown = useCallback(
    (ev: React.KeyboardEvent<HTMLDivElement>) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        onView(item)
      }
    },
    [item, onView]
  )

  const handleRemove = useCallback(() => {
    onRemove(item)
  }, [item, onRemove])

  return (
    <div
      role='link'
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      css={css`
        padding: 16px 0;
        border-bottom: 1px solid ${theme.color.divider.primary};
        cursor: pointer;
        :hover {
          color: ${theme.color.link.hover};
        }
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
        <div
          css={css`
            ${theme.typography.h2}
            ${textEllipsis}
          `}
        >
          {item.title}
        </div>
        <div
          role='none'
          onClick={stopPropagation}
          onKeyDown={stopPropagation}
          css={css`
            display: flex;
            align-items: center;
            color: ${theme.color.body.primary};
          `}
        >
          <Menu anchor={IconMoreAnchor}>
            <MenuItem
              before={
                isRemoving ? (
                  <Spinner size='small' />
                ) : (
                  <Icon name='heart' size='small' />
                )
              }
              label={intl.formatMessage({ defaultMessage: '取消收藏' })}
              disabled={isRemoving}
              onClick={handleRemove}
              closeOnClick={false}
            />
          </Menu>
        </div>
      </div>
      <div
        css={css`
          margin-top: 4px;
          color: ${theme.color.body.secondary};
          ${theme.typography.tooltip}
        `}
      >
        {new Date(item.updated_at).toLocaleDateString()}
      </div>
    </div>
  )
}
