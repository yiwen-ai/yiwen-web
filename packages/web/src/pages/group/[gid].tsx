import {
  GROUP_DETAIL_PATH,
  LayoutDivRefContext,
  NEW_CREATION_PATH,
  SetHeaderProps,
  ThemeContext,
} from '#/App'
import CollectionCompactItem from '#/components/CollectionCompactItem'
import CollectionItem from '#/components/CollectionItem'
import CollectionViewer from '#/components/CollectionViewer'
import CreateCollectionDialog from '#/components/CreateCollectionDialog'
import CreationCompactItem from '#/components/CreationCompactItem'
import CreationItem from '#/components/CreationItem'
import CreationSettingDialog from '#/components/CreationSettingDialog'
import CreationViewer from '#/components/CreationViewer'
import EditGroupDialog from '#/components/EditGroupDialog'
import ErrorPlaceholder from '#/components/ErrorPlaceholder'
import LargeDialog from '#/components/LargeDialog'
import { LoadMore } from '#/components/LoadMore'
import Loading from '#/components/Loading'
import MediumDialog from '#/components/MediumDialog'
import Placeholder from '#/components/Placeholder'
import PublicationCompactItem from '#/components/PublicationCompactItem'
import PublicationItem from '#/components/PublicationItem'
import PublicationSettingDialog from '#/components/PublicationSettingDialog'
import PublicationViewer from '#/components/PublicationViewer'
import { BREAKPOINT, MAX_WIDTH } from '#/shared'
import { useCreationSettingDialog } from '#/store/useCreationSettingDialog'
import { useEditGroupDialog } from '#/store/useEditGroupDialog'
import { GroupViewType, useGroupDetailPage } from '#/store/useGroupDetailPage'
import { usePublicationSettingDialog } from '#/store/usePublicationSettingDialog'
import { css, useTheme } from '@emotion/react'
import {
  Avatar,
  Button,
  IconButton,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabSection,
  textEllipsis,
  useToast,
  type ToastAPI,
} from '@yiwen-ai/component'
import {
  buildCollectionKey,
  buildCreationKey,
  buildPublicationKey,
  useEnsureAuthorizedCallback,
  type CollectionOutput,
  type CreationOutput,
  type GroupInfo,
  type GroupStatisticOutput,
  type PublicationOutput,
} from '@yiwen-ai/store'
import {
  joinURLPath,
  useScrollOnBottom,
  type AnchorProps,
} from '@yiwen-ai/util'
import { useCallback, useContext, useEffect } from 'react'
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
  const theme = useTheme()
  const setTheme = useContext(ThemeContext)
  const { renderToastContainer, pushToast } = useToast()
  const params = useParams<{ gid: string; type: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const ensureAuthorized = useEnsureAuthorizedCallback()

  const _gid = params.gid ?? null
  const _type = params.type as GroupViewType | GroupViewType.Publication
  const _cid = searchParams.get('cid')
  const _language = searchParams.get('language')
  const _version = searchParams.get('version')
  const _parent = searchParams.get('parent')

  const {
    isLoading,
    error,
    groupInfo,
    groupStatistic,
    hasGroupReadPermission,
    hasGroupAdminPermission,
    hasGroupMemberPermission,
    isGroupFollowed,
    isFollowingGroup,
    isUnfollowingGroup,
    onGroupFollow,
    onGroupUnfollow,
    collectionViewer: {
      open: collectionViewerOpen,
      close: onCollectionViewerClose,
      ...collectionViewer
    },
    collectionList: {
      createCollection: {
        show: showCreateCollectionDialog,
        ...createCollection
      },
      editCollection: { show: showEditCollectionDialog, ...editCollection },
      ...collectionList
    },
    archivedCollectionList,
    onCollectionArchive,
    onCollectionRestore,
    onCollectionDelete,
    onCollectionPublish,
    onArchivedCollectionDialogShow,
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
  } = useGroupDetailPage(
    pushToast,
    _gid,
    _cid,
    _language,
    _version,
    _type,
    _parent
  )

  const handleViewTypeChange = useCallback(
    (type: GroupViewType) => {
      navigate({
        pathname: generatePath(GROUP_DETAIL_PATH, { gid: _gid, type }),
      })
    },
    [_gid, navigate]
  )

  useEffect(() => {
    if (!params.type) {
      handleViewTypeChange(GroupViewType.Collection)
      // } else if (
      //   !hasGroupReadPermission &&
      //   params.type === GroupViewType.Creation
      // ) {
      //   handleViewTypeChange(GroupViewType.Publication)
    }
  }, [hasGroupReadPermission, params.type, handleViewTypeChange])

  const handleCollectionSetting = useCallback(
    (item: CollectionOutput) => {
      showEditCollectionDialog(item.gid, item.id)
    },
    [showEditCollectionDialog]
  )

  const handleCollectionDialogClose = useCallback(() => {
    onCollectionViewerClose()
    navigate({
      pathname: generatePath(GROUP_DETAIL_PATH, {
        gid: _gid,
        type: GroupViewType.Collection,
      }),
      search: _parent
        ? new URLSearchParams({
            cid: _parent,
          }).toString()
        : '',
    })
  }, [_gid, _parent, navigate, onCollectionViewerClose])

  const handlePublicationDialogClose = useCallback(() => {
    onPublicationViewerClose()
    navigate({
      pathname: generatePath(GROUP_DETAIL_PATH, {
        gid: _gid,
        type: _parent ? GroupViewType.Collection : GroupViewType.Publication,
      }),
      search: _parent
        ? new URLSearchParams({
            cid: _parent,
          }).toString()
        : '',
    })
  }, [_gid, _parent, navigate, onPublicationViewerClose])

  const handleCreationDialogClose = useCallback(() => {
    onCreationViewerClose()
    navigate({
      pathname: generatePath(GROUP_DETAIL_PATH, {
        gid: _gid,
        type: GroupViewType.Creation,
      }),
    })
  }, [_gid, navigate, onCreationViewerClose])

  const handleCollectionClick = useCallback(
    (item: CollectionOutput) => {
      navigate({
        pathname: generatePath(GROUP_DETAIL_PATH, {
          gid: Xid.fromValue(item.gid).toString(),
          type: GroupViewType.Collection,
        }),
        search: new URLSearchParams({
          cid: Xid.fromValue(item.id).toString(),
        }).toString(),
      })
    },
    [navigate]
  )

  const handlePublicationClick = useCallback(
    (item: PublicationOutput) => {
      navigate({
        pathname: generatePath(GROUP_DETAIL_PATH, {
          gid: Xid.fromValue(item.gid).toString(),
          type: GroupViewType.Publication,
        }),
        search: new URLSearchParams({
          cid: Xid.fromValue(item.cid).toString(),
          language: item.language,
          version: item.version.toString(),
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
          type: GroupViewType.Creation,
        }),
        search: new URLSearchParams({
          cid: Xid.fromValue(item.id).toString(),
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
              <Link
                to={
                  hasGroupMemberPermission
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
          <GroupPart
            pushToast={pushToast}
            groupInfo={groupInfo}
            groupStatistic={groupStatistic}
            hasGroupAdminPermission={hasGroupAdminPermission}
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
              value={_type}
              onChange={handleViewTypeChange}
              css={css`
                max-width: ${MAX_WIDTH};
                margin: 0 auto;
                padding-bottom: 24px;
              `}
            >
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
                <Tab value={GroupViewType.Collection}>
                  {intl.formatMessage({ defaultMessage: '合集' })}
                </Tab>
                <Tab value={GroupViewType.Publication}>
                  {intl.formatMessage({ defaultMessage: '文章' })}
                </Tab>
                {hasGroupReadPermission && (
                  <>
                    <Tab value={GroupViewType.Creation}>
                      {intl.formatMessage({ defaultMessage: '文稿' })}
                    </Tab>
                    <div
                      css={css`
                        margin-left: auto;
                        display: flex;
                        align-items: center;
                        @media (max-width: ${BREAKPOINT.small}px) {
                          display: none;
                        }
                      `}
                    >
                      {hasGroupAdminPermission &&
                        _type == GroupViewType.Collection && (
                          <>
                            <Button
                              color='secondary'
                              variant='text'
                              onClick={showCreateCollectionDialog}
                            >
                              {intl.formatMessage({
                                defaultMessage: '创建合集',
                              })}
                            </Button>
                            <CreateCollectionDialog {...createCollection} />
                            <CreateCollectionDialog {...editCollection} />
                          </>
                        )}
                      {(() => {
                        const anchor = (props: AnchorProps) => (
                          <Button color='secondary' variant='text' {...props}>
                            {intl.formatMessage({
                              defaultMessage: '查看已归档',
                            })}
                          </Button>
                        )
                        switch (_type) {
                          case GroupViewType.Collection:
                            return (
                              <MediumDialog
                                anchor={anchor}
                                title={intl.formatMessage({
                                  defaultMessage: '已归档的合集',
                                })}
                                onShow={onArchivedCollectionDialogShow}
                              >
                                <ArchivedCollectionPart
                                  {...archivedCollectionList}
                                  onRestore={onCollectionRestore}
                                  onDelete={onCollectionDelete}
                                />
                              </MediumDialog>
                            )
                          case GroupViewType.Publication:
                            return (
                              <MediumDialog
                                anchor={anchor}
                                title={intl.formatMessage({
                                  defaultMessage: '已归档的文章',
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
                  </>
                )}
              </TabList>
              <TabPanel value={GroupViewType.Collection}>
                <CollectionPart
                  {...collectionList}
                  onArchive={onCollectionArchive}
                  onPublish={onCollectionPublish}
                  onSetting={handleCollectionSetting}
                  onClick={handleCollectionClick}
                />
              </TabPanel>
              <TabPanel value={GroupViewType.Publication}>
                <PublicationPart
                  {...publicationList}
                  pushToast={pushToast}
                  onPublish={onPublicationPublish}
                  onEdit={onPublicationEdit}
                  onArchive={onPublicationArchive}
                  onClick={handlePublicationClick}
                />
              </TabPanel>
              <TabPanel value={GroupViewType.Creation}>
                <CreationPart
                  {...creationList}
                  pushToast={pushToast}
                  onRelease={onCreationRelease}
                  onArchive={onCreationArchive}
                  onClick={handleCreationClick}
                />
              </TabPanel>
            </TabSection>
          </div>
        </>
      ) : null}
      {collectionViewerOpen && (
        <LargeDialog open={true} onClose={handleCollectionDialogClose}>
          <CollectionViewer
            pushToast={pushToast}
            hasGroupAdminPermission={hasGroupAdminPermission}
            responsive={true}
            onClose={handleCollectionDialogClose}
            {...collectionViewer}
          />
        </LargeDialog>
      )}
      {publicationViewerOpen && (
        <LargeDialog open={true} onClose={handlePublicationDialogClose}>
          <PublicationViewer
            responsive={true}
            onEdit={onPublicationEdit}
            onClose={handlePublicationDialogClose}
            {...publicationViewer}
          />
        </LargeDialog>
      )}
      {creationViewerOpen && (
        <LargeDialog open={true} onClose={handleCreationDialogClose}>
          <CreationViewer
            responsive={true}
            onEdit={onCreationEdit}
            onClose={handleCreationDialogClose}
            {...creationViewer}
          />
        </LargeDialog>
      )}
    </>
  )
}

function GroupPart({
  pushToast,
  groupInfo,
  groupStatistic,
  hasGroupAdminPermission,
  isFollowed,
  isFollowing,
  isUnfollowing,
  onFollow,
  onUnfollow,
}: {
  pushToast: ToastAPI['pushToast']
  groupInfo: GroupInfo
  groupStatistic: GroupStatisticOutput
  hasGroupAdminPermission: boolean
  isFollowed: boolean
  isFollowing: boolean
  isUnfollowing: boolean
  onFollow: () => void
  onUnfollow: () => void
}) {
  const intl = useIntl()
  const theme = useTheme()
  const {
    show: showEditGroupDialog,
    close: closeEditGroupDialog,
    ...editGroup
  } = useEditGroupDialog(pushToast)
  const handleEditGroupClick = useCallback(() => {
    showEditGroupDialog(groupInfo.id)
  }, [showEditGroupDialog, groupInfo])

  return (
    <div
      css={css`
        box-shadow: ${theme.effect.divider};
      `}
    >
      <div
        css={css`
          max-width: 1080px;
          margin: 0 auto;
          padding: 36px 24px;
        `}
      >
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
            alt={groupInfo.name}
            size={80}
            css={css`
              gap: 12px;
            `}
          />
          <div
            css={css`
              margin-left: 8px;
              line-height: 20px;
            `}
          >
            <div>
              <strong css={textEllipsis}>{groupInfo.name}</strong>
              <span
                css={css`
                  margin-left: 8px;
                  ${theme.typography.tooltip}
                `}
              >
                @{groupInfo.cn}
              </span>
            </div>
            {groupInfo.slogan && (
              <div>
                <span
                  css={css`
                    ${theme.typography.body}
                  `}
                >
                  {groupInfo.slogan}
                </span>
              </div>
            )}
            <div>
              <span
                css={css`
                  ${theme.typography.tooltip}
                `}
              >
                {intl.formatMessage(
                  { defaultMessage: '{count} 篇公开内容' },
                  { count: groupStatistic.publications }
                )}
              </span>
            </div>
          </div>
        </div>
        <div
          css={css`
            margin-top: 16px;
            display: flex;
            align-items: center;
            gap: 24px;
          `}
        >
          {hasGroupAdminPermission && (
            <>
              <Button
                color='primary'
                variant='outlined'
                onClick={handleEditGroupClick}
              >
                {intl.formatMessage({ defaultMessage: '设置' })}
              </Button>
              <EditGroupDialog {...editGroup} />
            </>
          )}
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
        </div>
      </div>
    </div>
  )
}

function CollectionPart({
  isLoading,
  isValidating,
  error,
  items,
  hasMore,
  loadMore,
  hasGroupAdminPermission,
  isPublishing,
  isArchiving,
  onSetting,
  onArchive,
  onPublish,
  onClick,
}: {
  isLoading: boolean
  isValidating: boolean
  error: unknown
  items: CollectionOutput[]
  hasMore: boolean
  loadMore: () => void
  hasGroupAdminPermission: boolean
  isPublishing: (item: CollectionOutput) => boolean
  isArchiving: (item: CollectionOutput) => boolean
  onSetting: (item: CollectionOutput) => void
  onArchive: (item: CollectionOutput) => void
  onPublish: (item: CollectionOutput) => void
  onClick: (item: CollectionOutput) => void
}) {
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
        gap: 16px;
      `}
    >
      {!isLoading && error ? (
        <ErrorPlaceholder error={error} />
      ) : !isLoading && items.length === 0 ? (
        <Placeholder />
      ) : (
        <>
          {items.map((item) => (
            <CollectionItem
              key={buildCollectionKey(item.gid, item.id)}
              item={item}
              hasWritePermission={hasGroupAdminPermission}
              isPublishing={isPublishing(item)}
              isArchiving={isArchiving(item)}
              onClick={onClick}
              onPublish={onPublish}
              onSetting={onSetting}
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

function ArchivedCollectionPart({
  isLoading,
  error,
  items,
  hasMore,
  loadMore,
  hasGroupAdminPermission,
  isRestoring,
  isDeleting,
  onRestore,
  onDelete,
}: {
  isLoading: boolean
  error: unknown
  items: CollectionOutput[]
  hasMore: boolean
  loadMore: () => void
  hasGroupAdminPermission: boolean
  isRestoring: (item: CollectionOutput) => boolean
  isDeleting: (item: CollectionOutput) => boolean
  onRestore: (item: CollectionOutput) => void
  onDelete: (item: CollectionOutput) => void
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
            <CollectionCompactItem
              key={buildCollectionKey(item.gid, item.id)}
              item={item}
              hasWritePermission={hasGroupAdminPermission}
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

function PublicationPart({
  pushToast,
  isLoading,
  isValidating,
  error,
  items,
  hasMore,
  loadMore,
  hasGroupAdminPermission,
  isPublishing,
  isEditing,
  isArchiving,
  onPublish,
  onEdit,
  onArchive,
  onClick,
}: {
  pushToast: ToastAPI['pushToast']
  isLoading: boolean
  isValidating: boolean
  error: unknown
  items: PublicationOutput[]
  hasMore: boolean
  loadMore: () => void
  hasGroupAdminPermission: boolean
  isPublishing: (item: PublicationOutput) => boolean
  isEditing: (item: PublicationOutput) => boolean
  isArchiving: (item: PublicationOutput) => boolean
  onPublish: (item: PublicationOutput) => void
  onEdit: (item: PublicationOutput) => void
  onArchive: (item: PublicationOutput) => void
  onClick: (item: PublicationOutput) => void
}) {
  const { show: showPublicationSettingDialog, ...publicationSetting } =
    usePublicationSettingDialog(pushToast)

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
        gap: 16px;
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
              hasWritePermission={hasGroupAdminPermission}
              isPublishing={isPublishing(item)}
              isEditing={isEditing(item)}
              isArchiving={isArchiving(item)}
              onClick={onClick}
              onPublish={onPublish}
              onSetting={() =>
                showPublicationSettingDialog(
                  item.gid,
                  item.cid,
                  item.language,
                  item.version
                )
              }
              onArchive={onArchive}
            />
          ))}
          <LoadMore
            hasMore={hasMore}
            isLoadingMore={isLoading}
            onLoadMore={loadMore}
          />
          <PublicationSettingDialog {...publicationSetting} />
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
  hasGroupAdminPermission,
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
  hasGroupAdminPermission: boolean
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
              hasWritePermission={hasGroupAdminPermission}
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
  pushToast,
  isLoading,
  isValidating,
  error,
  items,
  hasMore,
  loadMore,
  hasGroupAdminPermission,
  isEditing,
  isReleasing,
  isArchiving,
  onRelease,
  onArchive,
  onClick,
}: {
  pushToast: ToastAPI['pushToast']
  isLoading: boolean
  isValidating: boolean
  error: unknown
  items: CreationOutput[]
  hasMore: boolean
  loadMore: () => void
  hasGroupAdminPermission: boolean
  isEditing: (item: CreationOutput) => boolean
  isReleasing: (item: CreationOutput) => boolean
  isArchiving: (item: CreationOutput) => boolean
  onRelease: (item: CreationOutput) => void
  onArchive: (item: CreationOutput) => void
  onClick: (item: CreationOutput) => void
}) {
  const { show: showCreationSettingDialog, ...creationSetting } =
    useCreationSettingDialog(pushToast)

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
        gap: 16px;
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
              hasWritePermission={hasGroupAdminPermission}
              isEditing={isEditing(item)}
              isReleasing={isReleasing(item)}
              isArchiving={isArchiving(item)}
              onClick={onClick}
              onSetting={() => showCreationSettingDialog(item.gid, item.id)}
              onRelease={onRelease}
              onArchive={onArchive}
            />
          ))}
          <LoadMore
            hasMore={hasMore}
            isLoadingMore={isLoading}
            onLoadMore={loadMore}
          />
          <CreationSettingDialog {...creationSetting} />
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
  hasGroupAdminPermission,
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
  hasGroupAdminPermission: boolean
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
              hasWritePermission={hasGroupAdminPermission}
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
