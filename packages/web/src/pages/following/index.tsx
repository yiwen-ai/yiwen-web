import ErrorPlaceholder from '#/components/ErrorPlaceholder'
import LargeDialog from '#/components/LargeDialog'
import LoadMore from '#/components/LoadMore'
import Loading from '#/components/Loading'
import Placeholder from '#/components/Placeholder'
import PublicationLink from '#/components/PublicationLink'
import PublicationViewer from '#/components/PublicationViewer'
import { BREAKPOINT } from '#/shared'
import { useFollowingPage } from '#/store/useFollowingPage'
import { css, useTheme } from '@emotion/react'
import { textEllipsis, useToast } from '@yiwen-ai/component'
import { buildPublicationKey, type PublicationOutput } from '@yiwen-ai/store'
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
          <>
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
        border-bottom: 1px solid ${theme.color.divider.primary};
        cursor: pointer;
        :hover {
          color: ${theme.color.body.linkHover};
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
    </PublicationLink>
  )
}
