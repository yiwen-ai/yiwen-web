import {
  GROUP_DETAIL_PATH,
  LayoutDivRefContext,
  NEW_CREATION_PATH,
  SetHeaderProps,
  ThemeContext,
} from '#/App'
import CollectionItem from '#/components/CollectionItem'
import CollectionViewer from '#/components/CollectionViewer'
import LargeDialog from '#/components/LargeDialog'
import { LoadMore } from '#/components/LoadMore'
import Loading from '#/components/Loading'
import PublicationViewer from '#/components/PublicationViewer'
import ResponsiveTabSection from '#/components/ResponsiveTabSection'
import { SectionHeader, SectionTitle } from '#/components/Section'
import { BREAKPOINT } from '#/shared'
import { useHomePage } from '#/store/useHomePage'
import { css, useTheme } from '@emotion/react'
import {
  Brand,
  Button,
  Icon,
  IconButton,
  TextField,
  TileButton,
  useToast,
} from '@yiwen-ai/component'
import {
  buildCollectionKey,
  isInWechat,
  useEnsureAuthorizedCallback,
  useLatestCollectionList,
  type CollectionOutput,
} from '@yiwen-ai/store'
import { useScrollOnBottom } from '@yiwen-ai/util'
import { useCallback, useContext } from 'react'
import { useIntl } from 'react-intl'
import { useResizeDetector } from 'react-resize-detector'
import { Link, generatePath, useNavigate } from 'react-router-dom'
import { Xid } from 'xid-ts'

export default function Home() {
  const intl = useIntl()
  const theme = useTheme()
  const navigate = useNavigate()
  const setTheme = useContext(ThemeContext)
  const { renderToastContainer, pushToast } = useToast()
  const ensureAuthorized = useEnsureAuthorizedCallback()

  const { width = 0, ref } = useResizeDetector<HTMLDivElement>()
  const isNarrow = width <= BREAKPOINT.small

  const { isLoading, isValidating, items, hasMore, loadMore } =
    useLatestCollectionList()

  const {
    onSearch,
    showCollectionViewer,
    collectionViewer: {
      open: collectionViewerOpen,
      close: onCollectionViewerClose,
      ...collectionViewer
    },
    publicationViewer: {
      open: publicationViewerOpen,
      close: onPublicationViewerClose,
      ...publicationViewer
    },
    responsiveTabSection,
  } = useHomePage(pushToast)

  const handleCollectionClick = useCallback(
    (item: CollectionOutput) => {
      isInWechat()
        ? navigate({
            pathname: generatePath(GROUP_DETAIL_PATH, {
              gid: Xid.fromValue(item.gid).toString(),
              type: 'collection',
            }),
            search: new URLSearchParams({
              cid: Xid.fromValue(item.id).toString(),
            }).toString(),
          })
        : showCollectionViewer(item.gid, item.id, undefined)
    },
    [showCollectionViewer, navigate]
  )

  return (
    <>
      {renderToastContainer()}
      <SetHeaderProps>
        <div
          ref={ref}
          css={css`
            flex: 1;
            margin: 0 36px;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 32px;
            @media (max-width: ${BREAKPOINT.small}px) {
              gap: 16px;
            }
          `}
        >
          {!isNarrow && (
            <Link to={NEW_CREATION_PATH} onClick={ensureAuthorized}>
              <Button color='primary' variant='text'>
                {intl.formatMessage({ defaultMessage: '创作内容' })}
              </Button>
            </Link>
          )}
          <IconButton
            iconName='celo'
            onClick={setTheme}
            css={css`
              height: 24px;
              width: 48px;
              border: 1px solid ${theme.palette.grayLight0};
              background: ${theme.color.body.background};
              color: ${theme.color.body.default};
              @media (max-width: ${BREAKPOINT.small}px) {
                width: 36px;
              }
            `}
          />
        </div>
      </SetHeaderProps>
      <div
        css={css`
          width: 100%;
          max-width: calc(820px + 24px * 2);
          margin: 60px auto 0;
          padding: 0 24px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          @media (max-width: ${BREAKPOINT.small}px) {
            margin: 24px auto 0;
          }
        `}
      >
        <div
          css={css`
            padding: 0 36px;
            @media (max-width: ${BREAKPOINT.small}px) {
              padding: 0 0;
            }
          `}
        >
          <Brand size='large' />
          <div
            css={css`
              margin-top: 12px;
              ${theme.typography.bodyBold}
              color: ${theme.color.body.secondary};
            `}
          >
            {intl.formatMessage({
              defaultMessage: '智能搜索内容，用熟悉的语言来阅读',
            })}
          </div>
        </div>
        <div
          css={css`
            margin-top: 12px;
            padding: 24px 36px;
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: center;
            gap: 24px 36px;
            border-radius: 30px;
            background: ${theme.color.button.tile.background};
            @media (max-width: ${BREAKPOINT.small}px) {
              padding: 16px 24px;
            }
          `}
        >
          <TextField
            size='large'
            before={<Icon name='search' />}
            placeholder={intl.formatMessage({
              defaultMessage: '搜索 yiwen.ai 的内容',
            })}
            inputtype='search'
            onEnter={onSearch}
            css={css`
              flex: 1;
              height: 48px;
              padding: 0 20px;
              border-radius: 20px;
              background: ${theme.color.body.background};
              @media (min-width: ${BREAKPOINT.small}px) {
                :focus-within + a {
                  position: absolute;
                  right: 0;
                  width: 0;
                  height: 0;
                  overflow: hidden;
                }
              }
            `}
          />
          {!isNarrow && (
            <Link to={NEW_CREATION_PATH}>
              <TileButton
                css={css`
                  padding: unset;
                  border: unset;
                  gap: 16px;
                `}
              >
                <div>
                  <div
                    css={css`
                      display: flex;
                      align-items: center;
                      gap: 8px;
                    `}
                  >
                    <span css={theme.typography.bodyBold}>
                      {intl.formatMessage({
                        defaultMessage: '我有内容，去创作',
                      })}
                    </span>
                    <Icon name='lampon' size='small' />
                  </div>
                  <div
                    css={css`
                      ${theme.typography.tooltip}
                      color: ${theme.color.body.secondary};
                    `}
                  >
                    {intl.formatMessage({
                      defaultMessage: '用 AI 进行语义搜索和全文智能翻译',
                    })}
                  </div>
                </div>
                <Icon
                  name='arrowcircleright'
                  css={css`
                    opacity: 0.4;
                  `}
                />
              </TileButton>
            </Link>
          )}
        </div>
      </div>
      <div
        css={css`
          display: block;
          position: relative;
          width: 100%;
          max-width: 1080px;
          min-width: 780px;
          margin: 100px auto 60px;
          padding: 0 24px;
          box-sizing: border-box;
          @media (max-width: ${BREAKPOINT.small}px) {
            margin: 24px auto;
            min-width: unset;
          }
        `}
      >
        <ResponsiveTabSection
          isNarrow={isNarrow}
          {...responsiveTabSection}
          css={css`
            position: absolute;
            top: 0;
            right: 24px;
            width: 300px;
            @media (max-width: ${BREAKPOINT.small}px) {
              position: relative;
              width: 100%;
              top: unset;
              right: unset;
              margin-bottom: 24px;
            }
          `}
        />
        <LatestCollections
          isNarrow={isNarrow}
          isLoading={isLoading}
          isValidating={isValidating}
          items={items}
          hasMore={hasMore}
          loadMore={loadMore}
          onClick={handleCollectionClick}
        />
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
      {collectionViewerOpen && (
        <LargeDialog open={true} onClose={onCollectionViewerClose}>
          <CollectionViewer
            pushToast={pushToast}
            responsive={true}
            onClose={onCollectionViewerClose}
            {...collectionViewer}
          />
        </LargeDialog>
      )}
    </>
  )
}

function LatestCollections({
  isNarrow,
  isLoading,
  isValidating,
  items,
  hasMore,
  loadMore,
  onClick,
}: {
  isNarrow: boolean
  isLoading: boolean
  isValidating: boolean
  items: CollectionOutput[]
  hasMore: boolean
  loadMore: () => void
  onClick: (item: CollectionOutput) => void
}) {
  const intl = useIntl()

  const layoutDivRef = useContext(
    LayoutDivRefContext
  ) as React.RefObject<HTMLDivElement>

  const shouldLoadMore = hasMore && !isValidating && loadMore
  const handleScroll = useCallback(() => {
    shouldLoadMore && shouldLoadMore()
  }, [shouldLoadMore])

  useScrollOnBottom({
    ref: layoutDivRef,
    autoTriggerBottomCount: 3,
    onBottom: handleScroll,
  })

  return (
    <div
      css={css`
        display: flex;
        flex-direction: column;
        width: calc(100% - 324px);
        gap: 8px;
        @media (max-width: ${BREAKPOINT.small}px) {
          width: 100%;
        }
      `}
    >
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <SectionHeader
            css={css`
              padding: 0 8px;
              @media (max-width: ${BREAKPOINT.small}px) {
                padding: 0;
              }
            `}
          >
            <SectionTitle
              iconName={'book'}
              label={intl.formatMessage({ defaultMessage: '合集' })}
              active={true}
            />
          </SectionHeader>
          {items.map((item) => (
            <CollectionItem
              key={buildCollectionKey(item.gid, item.id)}
              item={item}
              isNarrow={isNarrow}
              onClick={onClick}
            />
          ))}
          <LoadMore
            hasMore={hasMore}
            isLoadingMore={isLoading}
            onLoadMore={loadMore}
          />
        </>
      )}
    </div>
  )
}
