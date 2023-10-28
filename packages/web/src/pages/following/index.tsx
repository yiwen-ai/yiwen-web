import CreatedBy from '#/components/CreatedBy'
import ErrorPlaceholder from '#/components/ErrorPlaceholder'
import LargeDialog from '#/components/LargeDialog'
import { LoadMore } from '#/components/LoadMore'
import Loading from '#/components/Loading'
import Placeholder from '#/components/Placeholder'
import PublicationLink from '#/components/PublicationLink'
import PublicationViewer from '#/components/PublicationViewer'
import { BREAKPOINT } from '#/shared'
import { useFollowingPage } from '#/store/useFollowingPage'
import { css, useTheme } from '@emotion/react'
import { textEllipsis, useToast } from '@yiwen-ai/component'
import {
  buildPublicationKey,
  isRTL,
  type PublicationOutput,
} from '@yiwen-ai/store'
import { useCallback } from 'react'

export default function FollowingPage() {
  const { renderToastContainer, pushToast } = useToast()

  const {
    followedPublicationList: {
      isLoading,
      error,
      items,
      hasMore,
      isLoadingMore,
      loadMore,
    },
    onView,
    publicationViewer: {
      open: publicationViewerOpen,
      close: onPublicationViewerClose,
      ...publicationViewer
    },
  } = useFollowingPage(pushToast)

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
              <PublicationItem
                key={buildPublicationKey(item)}
                item={item}
                onView={onView}
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

function PublicationItem({
  item,
  onView,
}: {
  item: PublicationOutput
  onView: (item: PublicationOutput) => void
}) {
  const theme = useTheme()

  const handleClick = useCallback(() => {
    onView(item)
  }, [item, onView])

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
      </div>
      {item.summary && (
        <div
          dir={isRTL(item.language) ? 'rtl' : undefined}
          css={css`
            margin-top: 12px;
          `}
        >
          {item.summary.length < 140
            ? item.summary
            : item.summary.slice(0, 140) + '...'}
        </div>
      )}
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
