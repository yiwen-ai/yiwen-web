import { GROUP_DETAIL_PATH, NEW_CREATION_PATH, SetHeaderProps } from '#/App'
import CompactCreationItem from '#/components/CompactCreationItem'
import CompactPublicationItem from '#/components/CompactPublicationItem'
import CreationItem from '#/components/CreationItem'
import CreationViewer from '#/components/CreationViewer'
import ErrorPlaceholder from '#/components/ErrorPlaceholder'
import { IconMoreAnchor } from '#/components/IconMoreAnchor'
import LargeDialog from '#/components/LargeDialog'
import LoadMore from '#/components/LoadMore'
import Loading from '#/components/Loading'
import MediumDialog from '#/components/MediumDialog'
import Placeholder from '#/components/Placeholder'
import PublicationItem from '#/components/PublicationItem'
import PublicationViewer from '#/components/PublicationViewer'
import { MAX_WIDTH } from '#/shared'
import { GroupViewType, useGroupDetail } from '#/store/useGroupDetail'
import { css, useTheme } from '@emotion/react'
import {
  Avatar,
  Button,
  Menu,
  Tab,
  TabList,
  TabPanel,
  TabSection,
  useToast,
  type MenuItemProps,
  type ToastAPI,
} from '@yiwen-ai/component'
import {
  buildCreationKey,
  buildPublicationKey,
  type CreationOutput,
  type GroupInfo,
  type GroupStatisticOutput,
  type PublicationOutput,
} from '@yiwen-ai/store'
import { joinURLPath, type AnchorProps } from '@yiwen-ai/util'
import { useCallback, useMemo } from 'react'
import { useIntl } from 'react-intl'
import {
  Link,
  generatePath,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import { Xid } from 'xid-ts'

export default function GroupDetail() {
  const intl = useIntl()
  const { renderToastContainer, pushToast } = useToast()
  const params = useParams<{ gid: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

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
    type,
    switchType,
    publicationViewer: {
      onTranslate: onPublicationTranslate,
      ...publicationViewer
    },
    publicationList,
    archivedPublicationList,
    onPublicationPublish,
    onPublicationArchive,
    onPublicationRestore,
    onPublicationDelete,
    onArchivedPublicationDialogShow,
    creationViewer,
    creationList,
    archivedCreationList,
    onCreationRelease,
    onCreationArchive,
    onCreationRestore,
    onCreationDelete,
    onArchivedCreationDialogShow,
  } = useGroupDetail(pushToast, _gid, _cid, _language, _version, _type)

  const handleSwitchType = useCallback(
    (type: GroupViewType) => {
      switchType(type)
      navigate({
        pathname: generatePath(GROUP_DETAIL_PATH, { gid: _gid }),
        search: new URLSearchParams({ type }).toString(),
      })
    },
    [_gid, navigate, switchType]
  )

  const handlePublicationDialogClose = useCallback(() => {
    navigate({
      pathname: generatePath(GROUP_DETAIL_PATH, { gid: _gid }),
      search: new URLSearchParams({
        type: GroupViewType.Publication,
      }).toString(),
    })
  }, [_gid, navigate])

  const handleCreationDialogClose = useCallback(() => {
    navigate({
      pathname: generatePath(GROUP_DETAIL_PATH, { gid: _gid }),
      search: new URLSearchParams({
        type: GroupViewType.Creation,
      }).toString(),
    })
  }, [_gid, navigate])

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

  const handlePublicationTranslate = useCallback(
    async (language: string) => {
      const publication = await onPublicationTranslate(language)
      if (publication) {
        navigate({
          pathname: generatePath(GROUP_DETAIL_PATH, {
            gid: Xid.fromValue(publication.gid).toString(),
          }),
          search: new URLSearchParams({
            cid: Xid.fromValue(publication.cid).toString(),
            language: publication.language,
            version: publication.version.toString(),
            type: GroupViewType.Publication,
          }).toString(),
        })
      }
    },
    [navigate, onPublicationTranslate]
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
              {groupInfo.name && <span>{groupInfo.name}</span>}
              <Link
                to={joinURLPath(NEW_CREATION_PATH, { gid: _gid })}
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
            pushToast={pushToast}
            groupInfo={groupInfo}
            groupStatistic={groupStatistic}
          />
          <div
            css={css`
              padding: 0 24px;
            `}
          >
            <TabSection
              value={type}
              onChange={handleSwitchType}
              css={css`
                max-width: ${MAX_WIDTH};
                margin: 0 auto;
                padding-bottom: 24px;
              `}
            >
              <TabList
                css={css`
                  padding: 16px 24px;
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
                        {intl.formatMessage({ defaultMessage: '已归档的文章' })}
                      </Button>
                    )
                    switch (type) {
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
                              defaultMessage: '已归档的原稿',
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
              <TabPanel value={GroupViewType.Publication}>
                <PublicationPart
                  {...publicationList}
                  onPublish={onPublicationPublish}
                  onArchive={onPublicationArchive}
                  onClick={handlePublicationClick}
                />
              </TabPanel>
              <TabPanel value={GroupViewType.Creation}>
                <CreationPart
                  {...creationList}
                  onRelease={onCreationRelease}
                  onArchive={onCreationArchive}
                  onClick={handleCreationClick}
                />
              </TabPanel>
            </TabSection>
          </div>
        </>
      ) : null}
      {_gid &&
        _cid &&
        _language &&
        _version &&
        _type === GroupViewType.Publication && (
          <LargeDialog
            defaultOpen={true}
            onClose={handlePublicationDialogClose}
          >
            <PublicationViewer
              responsive={true}
              onTranslate={handlePublicationTranslate}
              {...publicationViewer}
            />
          </LargeDialog>
        )}
      {_gid && _cid && _type === GroupViewType.Creation && (
        <LargeDialog defaultOpen={true} onClose={handleCreationDialogClose}>
          <CreationViewer responsive={true} {...creationViewer} />
        </LargeDialog>
      )}
    </>
  )
}

function GroupPart({
  pushToast,
  groupInfo,
  groupStatistic,
}: {
  pushToast: ToastAPI['pushToast']
  groupInfo: GroupInfo
  groupStatistic: GroupStatisticOutput
}) {
  const intl = useIntl()
  const theme = useTheme()
  const logo = groupInfo.logo || groupInfo.owner?.picture

  //#region menu
  const handleDelete = useCallback(() => {
    // TODO
    pushToast({
      type: 'warning',
      message: intl.formatMessage({ defaultMessage: '删除' }),
      description: intl.formatMessage({ defaultMessage: '功能暂未实现' }),
    })
  }, [intl, pushToast])
  const handleSubscribe = useCallback(() => {
    // TODO
    pushToast({
      type: 'warning',
      message: intl.formatMessage({ defaultMessage: '订阅' }),
      description: intl.formatMessage({ defaultMessage: '功能暂未实现' }),
    })
  }, [intl, pushToast])
  const menuItems = useMemo<readonly MenuItemProps[]>(
    () => [
      {
        label: intl.formatMessage({ defaultMessage: '删除' }),
        danger: true,
        onClick: handleDelete,
      },
      {
        label: intl.formatMessage({ defaultMessage: '订阅' }),
        onClick: handleSubscribe,
      },
    ],
    [handleDelete, handleSubscribe, intl]
  )
  //#endregion

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
          padding: 40px 24px 48px;
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
          `}
        >
          {logo && (
            <Avatar
              src={logo}
              alt={groupInfo.name}
              css={css`
                margin-right: 12px;
              `}
            />
          )}
          <span
            css={css`
              color: ${theme.color.body.secondary};
            `}
          >
            {intl.formatMessage(
              { defaultMessage: '{owner} · {count} 篇公开文章' },
              { owner: groupInfo.name, count: groupStatistic.publications }
            )}
          </span>
        </div>
        <div
          css={css`
            margin-top: 24px;
            display: flex;
            align-items: center;
            gap: 24px;
          `}
        >
          <Button color='primary' variant='outlined'>
            {intl.formatMessage({ defaultMessage: '编辑简介' })}
          </Button>
          <Menu anchor={IconMoreAnchor} items={menuItems} />
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
  isPublishing,
  isArchiving,
  onPublish,
  onArchive,
  onClick,
}: {
  isLoading: boolean
  error: unknown
  items: PublicationOutput[]
  hasMore: boolean
  loadMore: () => void
  isPublishing: (item: PublicationOutput) => boolean
  isArchiving: (item: PublicationOutput) => boolean
  onPublish: (item: PublicationOutput) => void
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
              isPublishing={isPublishing(item)}
              isArchiving={isArchiving(item)}
              onClick={onClick}
              onPublish={onPublish}
              onArchive={onArchive}
            />
          ))}
          <LoadMore
            isLoadingMore={isLoading}
            hasMore={hasMore}
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
            <CompactPublicationItem
              key={buildPublicationKey(item)}
              item={item}
              isRestoring={isRestoring(item)}
              isDeleting={isDeleting(item)}
              onRestore={onRestore}
              onDelete={onDelete}
            />
          ))}
          <LoadMore
            isLoadingMore={isLoading}
            hasMore={hasMore}
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
  isReleasing,
  isArchiving,
  onRelease,
  onArchive,
  onClick,
}: {
  isLoading: boolean
  error: unknown
  items: CreationOutput[]
  hasMore: boolean
  loadMore: () => void
  isReleasing: (item: CreationOutput) => boolean
  isArchiving: (item: CreationOutput) => boolean
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
              isReleasing={isReleasing(item)}
              isArchiving={isArchiving(item)}
              onClick={onClick}
              onRelease={onRelease}
              onArchive={onArchive}
            />
          ))}
          <LoadMore
            isLoadingMore={isLoading}
            hasMore={hasMore}
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
            <CompactCreationItem
              key={buildCreationKey(item)}
              item={item}
              isRestoring={isRestoring(item)}
              isDeleting={isDeleting(item)}
              onRestore={onRestore}
              onDelete={onDelete}
            />
          ))}
          <LoadMore
            isLoadingMore={isLoading}
            hasMore={hasMore}
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
