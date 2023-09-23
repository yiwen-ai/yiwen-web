import { GROUP_DETAIL_PATH, NEW_CREATION_PATH, SetHeaderProps } from '#/App'
import CreationCompactItem from '#/components/CreationCompactItem'
import CreationItem from '#/components/CreationItem'
import CreationViewer from '#/components/CreationViewer'
import ErrorPlaceholder from '#/components/ErrorPlaceholder'
import LargeDialog from '#/components/LargeDialog'
import LoadMore from '#/components/LoadMore'
import Loading from '#/components/Loading'
import MediumDialog from '#/components/MediumDialog'
import Placeholder from '#/components/Placeholder'
import PublicationCompactItem from '#/components/PublicationCompactItem'
import PublicationItem from '#/components/PublicationItem'
import PublicationViewer from '#/components/PublicationViewer'
import { MAX_WIDTH } from '#/shared'
import { GroupViewType, useGroupDetailPage } from '#/store/useGroupDetailPage'
import { css, useTheme } from '@emotion/react'
import {
  Avatar,
  Button,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabSection,
  useToast,
} from '@yiwen-ai/component'
import {
  buildCreationKey,
  buildPublicationKey,
  useEnsureAuthorizedCallback,
  type CreationOutput,
  type GroupInfo,
  type GroupStatisticOutput,
  type PublicationOutput,
} from '@yiwen-ai/store'
import { joinURLPath, type AnchorProps } from '@yiwen-ai/util'
import { useCallback } from 'react'
import { useIntl } from 'react-intl'
import {
  Link,
  generatePath,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import { Xid } from 'xid-ts'

export default function GroupDetailPage() {
  const intl = useIntl()
  const { renderToastContainer, pushToast } = useToast()
  const params = useParams<{ gid: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const ensureAuthorized = useEnsureAuthorizedCallback()

  const _gid = params.gid ?? null
  const _cid = searchParams.get('cid')
  const _language = searchParams.get('language')
  const _version = searchParams.get('version')
  const _type = searchParams.get('type') as GroupViewType | null

  const {
    isLoading,
    error,
    groupInfo,
    groupStatistic,
    hasGroupReadPermission,
    hasGroupAddCreationPermission,
    isGroupFollowed,
    isFollowingGroup,
    isUnfollowingGroup,
    onGroupFollow,
    onGroupUnfollow,
    viewType,
    setViewType,
    publicationViewer: {
      open: publicationViewerOpen,
      close: onPublicationViewerClose,
      ...publicationViewer
    },
    publicationList,
    archivedPublicationList,
    onPublicationPublish,
    onPublicationArchive,
    onPublicationRestore,
    onPublicationEdit,
    onPublicationDelete,
    onArchivedPublicationDialogShow,
    creationViewer: {
      open: creationViewerOpen,
      close: onCreationViewerClose,
      ...creationViewer
    },
    creationList,
    archivedCreationList,
    onCreationRelease,
    onCreationArchive,
    onCreationRestore,
    onCreationEdit,
    onCreationDelete,
    onArchivedCreationDialogShow,
  } = useGroupDetailPage(pushToast, _gid, _cid, _language, _version, _type)

  const handleViewTypeChange = useCallback(
    (type: GroupViewType) => {
      setViewType(type)
      navigate({
        pathname: generatePath(GROUP_DETAIL_PATH, { gid: _gid }),
        search: new URLSearchParams({ type }).toString(),
      })
    },
    [_gid, navigate, setViewType]
  )

  const handlePublicationDialogClose = useCallback(() => {
    onPublicationViewerClose()
    navigate({
      pathname: generatePath(GROUP_DETAIL_PATH, { gid: _gid }),
      search: new URLSearchParams({
        type: GroupViewType.Publication,
      }).toString(),
    })
  }, [_gid, navigate, onPublicationViewerClose])

  const handleCreationDialogClose = useCallback(() => {
    onCreationViewerClose()
    navigate({
      pathname: generatePath(GROUP_DETAIL_PATH, { gid: _gid }),
      search: new URLSearchParams({
        type: GroupViewType.Creation,
      }).toString(),
    })
  }, [_gid, navigate, onCreationViewerClose])

  const handlePublicationClick = useCallback(
    (item: PublicationOutput) => {
      navigate({
        pathname: generatePath(GROUP_DETAIL_PATH, {
          gid: Xid.fromValue(item.gid).toString(),
        }),
        search: new URLSearchParams({
          cid: Xid.fromValue(item.cid).toString(),
          language: item.language,
          version: item.version.toString(),
          type: GroupViewType.Publication,
        }).toString(),
      })
    },
    [navigate]
  )

  const handleCreationClick = useCallback(
    (item: CreationOutput) => {
      navigate({
        pathname: generatePath(GROUP_DETAIL_PATH, {
          gid: Xid.fromValue(item.gid).toString(),
        }),
        search: new URLSearchParams({
          cid: Xid.fromValue(item.id).toString(),
          type: GroupViewType.Creation,
        }).toString(),
      })
    },
    [navigate]
  )

  return (
    <>
      {renderToastContainer()}
      {isLoading ? (
        <Loading />
      ) : error ? (
        <ErrorPlaceholder error={error} />
      ) : groupInfo && groupStatistic ? (
        <>
          <SetHeaderProps>
            <div
              css={css`
                flex: 1;
                margin: 0 40px 0 12px;
                display: flex;
                align-items: center;
                gap: 40px;
              `}
            >
              <Link
                to={
                  hasGroupAddCreationPermission
                    ? joinURLPath(NEW_CREATION_PATH, { gid: _gid })
                    : joinURLPath(NEW_CREATION_PATH, { gid: undefined })
                }
                onClick={ensureAuthorized}
                css={css`
                  margin-left: auto;
                `}
              >
                <Button color='primary' variant='text'>
                  {intl.formatMessage({ defaultMessage: '创作内容' })}
                </Button>
              </Link>
            </div>
          </SetHeaderProps>
          <GroupPart
            groupInfo={groupInfo}
            groupStatistic={groupStatistic}
            isFollowed={isGroupFollowed}
            isFollowing={isFollowingGroup}
            isUnfollowing={isUnfollowingGroup}
            onFollow={onGroupFollow}
            onUnfollow={onGroupUnfollow}
          />
          <div
            css={css`
              padding: 0 24px;
            `}
          >
            <TabSection
              value={viewType}
              onChange={handleViewTypeChange}
              css={css`
                max-width: ${MAX_WIDTH};
                margin: 0 auto;
                padding-top: ${hasGroupReadPermission ? undefined : '24px'};
                padding-bottom: 24px;
              `}
            >
              {hasGroupReadPermission && (
                <TabList
                  css={(theme) => css`
                    padding: 16px;
                    border: unset;

                    > [role='tab'] {
                      padding: 8px;
                      &,
                      &[data-selected] {
                        ${theme.typography.h2}
                      }
                      &[data-selected] {
                        ::after {
                          bottom: -3px;
                        }
                      }
                    }
                  `}
                >
                  <Tab value={GroupViewType.Publication}>
                    {intl.formatMessage({ defaultMessage: '发布' })}
                  </Tab>
                  <Tab value={GroupViewType.Creation}>
                    {intl.formatMessage({ defaultMessage: '文稿' })}
                  </Tab>
                  <div
                    css={css`
                      margin-left: auto;
                      display: flex;
                      align-items: center;
                    `}
                  >
                    {(() => {
                      const anchor = (props: AnchorProps) => (
                        <Button color='secondary' variant='text' {...props}>
                          {intl.formatMessage({
                            defaultMessage: '查看已归档',
                          })}
                        </Button>
                      )
                      switch (viewType) {
                        case GroupViewType.Publication:
                          return (
                            <MediumDialog
                              anchor={anchor}
                              title={intl.formatMessage({
                                defaultMessage: '已归档的发布',
                              })}
                              onShow={onArchivedPublicationDialogShow}
                            >
                              <ArchivedPublicationPart
                                {...archivedPublicationList}
                                onRestore={onPublicationRestore}
                                onDelete={onPublicationDelete}
                              />
                            </MediumDialog>
                          )
                        case GroupViewType.Creation:
                          return (
                            <MediumDialog
                              anchor={anchor}
                              title={intl.formatMessage({
                                defaultMessage: '已归档的文稿',
                              })}
                              onShow={onArchivedCreationDialogShow}
                            >
                              <ArchivedCreationPart
                                {...archivedCreationList}
                                onRestore={onCreationRestore}
                                onDelete={onCreationDelete}
                              />
                            </MediumDialog>
                          )
                      }
                    })()}
                  </div>
                </TabList>
              )}
              <TabPanel value={GroupViewType.Publication}>
                <PublicationPart
                  {...publicationList}
                  onPublish={onPublicationPublish}
                  onEdit={onPublicationEdit}
                  onArchive={onPublicationArchive}
                  onClick={handlePublicationClick}
                />
              </TabPanel>
              <TabPanel value={GroupViewType.Creation}>
                <CreationPart
                  {...creationList}
                  onEdit={onCreationEdit}
                  onRelease={onCreationRelease}
                  onArchive={onCreationArchive}
                  onClick={handleCreationClick}
                />
              </TabPanel>
            </TabSection>
          </div>
        </>
      ) : null}
      {publicationViewerOpen && (
        <LargeDialog open={true} onClose={handlePublicationDialogClose}>
          <PublicationViewer
            responsive={true}
            onClose={handlePublicationDialogClose}
            {...publicationViewer}
          />
        </LargeDialog>
      )}
      {creationViewerOpen && (
        <LargeDialog open={true} onClose={handleCreationDialogClose}>
          <CreationViewer
            responsive={true}
            onClose={handleCreationDialogClose}
            {...creationViewer}
          />
        </LargeDialog>
      )}
    </>
  )
}

function GroupPart({
  groupInfo,
  groupStatistic,
  isFollowed,
  isFollowing,
  isUnfollowing,
  onFollow,
  onUnfollow,
}: {
  groupInfo: GroupInfo
  groupStatistic: GroupStatisticOutput
  isFollowed: boolean
  isFollowing: boolean
  isUnfollowing: boolean
  onFollow: () => void
  onUnfollow: () => void
}) {
  const intl = useIntl()
  const theme = useTheme()

  // TODO
  // const handleDelete = useCallback(() => {
  // }, [])

  return (
    <div
      css={css`
        border-bottom: 1px solid ${theme.color.divider.primary};
      `}
    >
      <div
        css={css`
          max-width: 1080px;
          margin: 0 auto;
          padding: 36px 24px;
        `}
      >
        {groupInfo.slogan && (
          <h2
            css={css`
              margin-bottom: 12px;
              ${theme.typography.h2}
            `}
          >
            {groupInfo.slogan}
          </h2>
        )}
        <div
          css={css`
            display: flex;
            align-items: center;
            gap: 8px;
            color: ${theme.color.body.secondary};
          `}
        >
          <Avatar
            src={groupInfo.logo || groupInfo.owner?.picture}
            name={groupInfo.name}
            size={32}
            css={css`
              gap: 12px;
            `}
          />
          <i>·</i>
          <span>
            {intl.formatMessage(
              { defaultMessage: '{count} 篇公开内容' },
              { count: groupStatistic.publications }
            )}
          </span>
        </div>
        <div
          css={css`
            margin-top: 16px;
            display: flex;
            align-items: center;
            gap: 24px;
          `}
        >
          <Button
            color='primary'
            variant='outlined'
            css={css`
              display: none;
            `}
          >
            {intl.formatMessage({ defaultMessage: '编辑简介' })}
          </Button>
          <Button
            color='primary'
            variant='outlined'
            disabled={isFollowing || isUnfollowing}
            onClick={isFollowed ? onUnfollow : onFollow}
          >
            {(isFollowing || isUnfollowing) && <Spinner size='small' />}
            {isFollowed
              ? intl.formatMessage({ defaultMessage: '取消关注' })
              : intl.formatMessage({ defaultMessage: '关注' })}
          </Button>
          {/* <Menu anchor={IconMoreAnchor}>
            <MenuItem
              label={intl.formatMessage({ defaultMessage: '删除' })}
              danger={true}
              onClick={handleDelete}
            />
          </Menu> */}
        </div>
      </div>
    </div>
  )
}

function PublicationPart({
  isLoading,
  error,
  items,
  hasMore,
  loadMore,
  hasGroupWritePermission,
  isPublishing,
  isEditing,
  isArchiving,
  onPublish,
  onEdit,
  onArchive,
  onClick,
}: {
  isLoading: boolean
  error: unknown
  items: PublicationOutput[]
  hasMore: boolean
  loadMore: () => void
  hasGroupWritePermission: boolean
  isPublishing: (item: PublicationOutput) => boolean
  isEditing: (item: PublicationOutput) => boolean
  isArchiving: (item: PublicationOutput) => boolean
  onPublish: (item: PublicationOutput) => void
  onEdit: (item: PublicationOutput) => void
  onArchive: (item: PublicationOutput) => void
  onClick: (item: PublicationOutput) => void
}) {
  return (
    <div
      css={css`
        display: flex;
        flex-direction: column;
        gap: 24px;
      `}
    >
      {!isLoading && error ? (
        <ErrorPlaceholder error={error} />
      ) : !isLoading && items.length === 0 ? (
        <Placeholder />
      ) : (
        <>
          {items.map((item) => (
            <PublicationItem
              key={buildPublicationKey(item)}
              item={item}
              hasWritePermission={hasGroupWritePermission}
              isPublishing={isPublishing(item)}
              isEditing={isEditing(item)}
              isArchiving={isArchiving(item)}
              onClick={onClick}
              onPublish={onPublish}
              onEdit={onEdit}
              onArchive={onArchive}
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

function ArchivedPublicationPart({
  isLoading,
  error,
  items,
  hasMore,
  loadMore,
  hasGroupWritePermission,
  isRestoring,
  isDeleting,
  onRestore,
  onDelete,
}: {
  isLoading: boolean
  error: unknown
  items: PublicationOutput[]
  hasMore: boolean
  loadMore: () => void
  hasGroupWritePermission: boolean
  isRestoring: (item: PublicationOutput) => boolean
  isDeleting: (item: PublicationOutput) => boolean
  onRestore: (item: PublicationOutput) => void
  onDelete: (item: PublicationOutput) => void
}) {
  return (
    <div
      css={css`
        padding: 0 24px 24px;
        display: flex;
        flex-direction: column;
      `}
    >
      {!isLoading && error ? (
        <ErrorPlaceholder error={error} />
      ) : !isLoading && items.length === 0 ? (
        <Placeholder
          css={css`
            margin: 12px;
          `}
        />
      ) : (
        <>
          {items.map((item) => (
            <PublicationCompactItem
              key={buildPublicationKey(item)}
              item={item}
              hasWritePermission={hasGroupWritePermission}
              isRestoring={isRestoring(item)}
              isDeleting={isDeleting(item)}
              onRestore={onRestore}
              onDelete={onDelete}
            />
          ))}
          <LoadMore
            hasMore={hasMore}
            isLoadingMore={isLoading}
            onLoadMore={loadMore}
            css={css`
              margin-bottom: -24px;
            `}
          />
        </>
      )}
    </div>
  )
}

function CreationPart({
  isLoading,
  error,
  items,
  hasMore,
  loadMore,
  hasGroupWritePermission,
  isEditing,
  isReleasing,
  isArchiving,
  onEdit,
  onRelease,
  onArchive,
  onClick,
}: {
  isLoading: boolean
  error: unknown
  items: CreationOutput[]
  hasMore: boolean
  loadMore: () => void
  hasGroupWritePermission: boolean
  isEditing: (item: CreationOutput) => boolean
  isReleasing: (item: CreationOutput) => boolean
  isArchiving: (item: CreationOutput) => boolean
  onEdit: (item: CreationOutput) => void
  onRelease: (item: CreationOutput) => void
  onArchive: (item: CreationOutput) => void
  onClick: (item: CreationOutput) => void
}) {
  return (
    <div
      css={css`
        display: flex;
        flex-direction: column;
        gap: 24px;
      `}
    >
      {!isLoading && error ? (
        <ErrorPlaceholder error={error} />
      ) : !isLoading && items.length === 0 ? (
        <Placeholder />
      ) : (
        <>
          {items.map((item) => (
            <CreationItem
              key={buildCreationKey(item)}
              item={item}
              hasWritePermission={hasGroupWritePermission}
              isEditing={isEditing(item)}
              isReleasing={isReleasing(item)}
              isArchiving={isArchiving(item)}
              onClick={onClick}
              onEdit={onEdit}
              onRelease={onRelease}
              onArchive={onArchive}
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

function ArchivedCreationPart({
  isLoading,
  error,
  items,
  hasMore,
  loadMore,
  hasGroupWritePermission,
  isRestoring,
  isDeleting,
  onRestore,
  onDelete,
}: {
  isLoading: boolean
  error: unknown
  items: CreationOutput[]
  hasMore: boolean
  loadMore: () => void
  hasGroupWritePermission: boolean
  isRestoring: (item: CreationOutput) => boolean
  isDeleting: (item: CreationOutput) => boolean
  onRestore: (item: CreationOutput) => void
  onDelete: (item: CreationOutput) => void
}) {
  return (
    <div
      css={css`
        padding: 0 24px 24px;
        display: flex;
        flex-direction: column;
      `}
    >
      {!isLoading && error ? (
        <ErrorPlaceholder error={error} />
      ) : !isLoading && items.length === 0 ? (
        <Placeholder
          css={css`
            margin: 12px;
          `}
        />
      ) : (
        <>
          {items.map((item) => (
            <CreationCompactItem
              key={buildCreationKey(item)}
              item={item}
              hasWritePermission={hasGroupWritePermission}
              isRestoring={isRestoring(item)}
              isDeleting={isDeleting(item)}
              onRestore={onRestore}
              onDelete={onDelete}
            />
          ))}
          <LoadMore
            hasMore={hasMore}
            isLoadingMore={isLoading}
            onLoadMore={loadMore}
            css={css`
              margin-bottom: -24px;
            `}
          />
        </>
      )}
    </div>
  )
}
