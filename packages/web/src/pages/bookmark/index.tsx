import CreatedBy from '#/components/CreatedBy'
import ErrorPlaceholder from '#/components/ErrorPlaceholder'
import { renderIconMoreAnchor } from '#/components/IconMoreAnchor'
import LargeDialog from '#/components/LargeDialog'
import LoadMore from '#/components/LoadMore'
import Loading from '#/components/Loading'
import Placeholder from '#/components/Placeholder'
import PublicationLink from '#/components/PublicationLink'
import PublicationViewer from '#/components/PublicationViewer'
import { BREAKPOINT } from '#/shared'
import { useBookmarkPage } from '#/store/useBookmarkPage'
import { css, useTheme } from '@emotion/react'
import {
  Icon,
  Menu,
  MenuItem,
  Spinner,
  textEllipsis,
  useToast,
} from '@yiwen-ai/component'
import { isRTL, type BookmarkOutput } from '@yiwen-ai/store'
import { preventDefaultStopPropagation } from '@yiwen-ai/util'
import { useCallback } from 'react'
import { useIntl } from 'react-intl'
import { Xid } from 'xid-ts'

export default function BookmarkPage() {
  const { renderToastContainer, pushToast } = useToast()

  const {
    isLoading,
    error,
    items,
    hasMore,
    isLoadingMore,
    loadMore,
    isRemoving,
    onView,
    onRemove,
    publicationViewer: {
      open: publicationViewerOpen,
      close: onPublicationViewerClose,
      ...publicationViewer
    },
  } = useBookmarkPage(pushToast)

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
          <div
            css={css`
              max-width: 800px;
              margin: auto;
            `}
          >
            {items.map((item) => (
              <BookmarkItem
                key={Xid.fromValue(item.id).toString()}
                item={item}
                isRemoving={isRemoving(item)}
                onView={onView}
                onRemove={onRemove}
              />
            ))}
            <LoadMore
              hasMore={hasMore}
              isLoadingMore={isLoadingMore}
              onLoadMore={loadMore}
            />
          </div>
        )}
      </div>
      {publicationViewerOpen && (
        <LargeDialog open={true} onClose={onPublicationViewerClose}>
          <PublicationViewer
            responsive={true}
            onClose={onPublicationViewerClose}
            {...publicationViewer}
          />
        </LargeDialog>
      )}
    </>
  )
}

function BookmarkItem({
  item,
  isRemoving,
  onView,
  onRemove,
}: {
  item: BookmarkOutput
  isRemoving: boolean
  onView: (item: BookmarkOutput) => void
  onRemove: (item: BookmarkOutput) => void
}) {
  const intl = useIntl()
  const theme = useTheme()

  const handleClick = useCallback(() => {
    onView(item)
  }, [item, onView])

  const handleRemove = useCallback(() => {
    onRemove(item)
  }, [item, onRemove])

  return (
    <PublicationLink
      gid={item.gid}
      cid={item.cid}
      language={item.language}
      version={item.version}
      onClick={handleClick}
      css={css`
        display: block;
        padding: 16px 0;
        border-bottom: 1px solid ${theme.color.divider.default};
        cursor: pointer;
        :hover {
          color: ${theme.color.body.primaryHover};
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
          dir={isRTL(item.language) ? 'rtl' : undefined}
          css={css`
            ${theme.typography.h2}
            ${textEllipsis}
          `}
        >
          {item.title}
        </div>
        <div
          role='none'
          onClick={preventDefaultStopPropagation}
          css={css`
            display: flex;
            align-items: center;
            color: ${theme.color.body.default};
          `}
        >
          <Menu anchor={renderIconMoreAnchor}>
            <MenuItem
              before={
                isRemoving ? (
                  <Spinner size='small' />
                ) : (
                  <Icon name='heart' size='small' />
                )
              }
              label={intl.formatMessage({ defaultMessage: '移除书签' })}
              disabled={isRemoving}
              onClick={handleRemove}
              closeOnClick={false}
            />
          </Menu>
        </div>
      </div>
      {item.group_info && (
        <CreatedBy
          item={item.group_info}
          timestamp={item.updated_at}
          css={css`
            margin-top: 8px;
          `}
        />
      )}
    </PublicationLink>
  )
}
