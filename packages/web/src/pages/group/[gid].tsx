import {
  CREATION_DETAIL_PATH,
  NEW_CREATION_PATH,
  PUBLICATION_DETAIL_PATH,
  SetHeaderProps,
} from '#/App'
import CompactCreationItem from '#/components/CompactCreationItem'
import CompactPublicationItem from '#/components/CompactPublicationItem'
import CreationItem from '#/components/CreationItem'
import { IconMoreAnchor } from '#/components/IconMoreAnchor'
import LoadMore from '#/components/LoadMore'
import Loading from '#/components/Loading'
import MediumDialog from '#/components/MediumDialog'
import Placeholder from '#/components/Placeholder'
import PublicationItem from '#/components/PublicationItem'
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
  CreationStatus,
  PublicationStatus,
  buildCreationKey,
  buildPublicationKey,
  toMessage,
  useCreationList,
  useMyGroupList,
  usePublicationList,
  type CreationOutput,
  type Group,
  type PublicationOutput,
} from '@yiwen-ai/store'
import { type AnchorProps } from '@yiwen-ai/util'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import {
  Link,
  generatePath,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import { Xid } from 'xid-ts'

// eslint-disable-next-line react-refresh/only-export-components
export enum GroupDetailTabKey {
  Publication = 'publication',
  Creation = 'creation',
}

export default function GroupDetail() {
  const intl = useIntl()
  const toast = useToast()
  const params = useParams<{ gid: string; cid?: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const [tab, setTab] = useState(
    (searchParams.get('tab') as GroupDetailTabKey | null) ??
      GroupDetailTabKey.Publication
  )
  const updateTab = useCallback(
    (tab: GroupDetailTabKey) => {
      setTab(tab)
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set('tab', tab)
          return next
        },
        { replace: true }
      )
    },
    [setSearchParams]
  )
  const group = useMyGroupList().defaultGroup // TODO: get group by gid

  return (
    <>
      {toast.render()}
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
          {group?.name && (
            <span>
              {intl.formatMessage(
                { defaultMessage: '{name} 的创作群组' },
                { name: group.name }
              )}
            </span>
          )}
          <Link
            to={{
              pathname: NEW_CREATION_PATH,
              search: params.gid
                ? new URLSearchParams({ gid: params.gid }).toString()
                : '',
            }}
            css={css`
              margin-left: auto;
            `}
          >
            <Button variant='text'>
              {intl.formatMessage({ defaultMessage: '创作内容' })}
            </Button>
          </Link>
        </div>
      </SetHeaderProps>
      {!group ? (
        <Loading />
      ) : (
        <WithGroup toast={toast} group={group} tab={tab} setTab={updateTab} />
      )}
    </>
  )
}

function WithGroup({
  toast,
  group,
  tab,
  setTab,
}: {
  toast: ToastAPI
  group: Group
  tab: GroupDetailTabKey
  setTab: (tab: GroupDetailTabKey) => void
}) {
  const intl = useIntl()

  //#region creation list
  const creationList = useCreationList({ gid: group.id })
  const archivedCreationList = useCreationList({
    gid: group.id,
    status: CreationStatus.Archived,
  })
  const { refresh: refreshCreationList } = creationList
  const { refresh: refreshArchivedCreationList } = archivedCreationList
  const onArchiveCreation = useCallback(
    () => refreshArchivedCreationList(),
    [refreshArchivedCreationList]
  )
  const onRestoreCreation = useCallback(
    () => refreshCreationList(),
    [refreshCreationList]
  )
  //#endregion

  //#region publication list
  const publicationList = usePublicationList({ gid: group.id })
  const archivedPublicationList = usePublicationList({
    gid: group.id,
    status: PublicationStatus.Archived,
  })
  const { refresh: refreshPublicationList } = publicationList
  const { refresh: refreshArchivedPublicationList } = archivedPublicationList
  const onArchivePublication = useCallback(
    () => refreshArchivedPublicationList(),
    [refreshArchivedPublicationList]
  )
  const onRestorePublication = useCallback(
    () => refreshPublicationList(),
    [refreshPublicationList]
  )
  //#endregion

  return (
    <div>
      <GroupPart toast={toast} group={group} />
      <TabSection
        value={tab}
        onChange={setTab}
        css={css`
          max-width: 800px;
          margin: 0 auto;
          padding: 0 24px 40px;
        `}
      >
        <TabList
          css={css`
            padding: 16px 24px;
          `}
        >
          <Tab value={GroupDetailTabKey.Publication}>
            {intl.formatMessage({ defaultMessage: '发布' })}
          </Tab>
          <Tab value={GroupDetailTabKey.Creation}>
            {intl.formatMessage({ defaultMessage: '原稿' })}
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
                    defaultMessage: '已归档的文章',
                  })}
                </Button>
              )
              switch (tab) {
                case GroupDetailTabKey.Publication:
                  return (
                    <MediumDialog
                      anchor={anchor}
                      title={intl.formatMessage({
                        defaultMessage: '已归档的发布',
                      })}
                    >
                      <ArchivedPublicationPart
                        toast={toast}
                        list={archivedPublicationList}
                        onRestore={onRestorePublication}
                      />
                    </MediumDialog>
                  )
                case GroupDetailTabKey.Creation:
                  return (
                    <MediumDialog
                      anchor={anchor}
                      title={intl.formatMessage({
                        defaultMessage: '已归档的原稿',
                      })}
                    >
                      <ArchivedCreationPart
                        toast={toast}
                        list={archivedCreationList}
                        onRestore={onRestoreCreation}
                      />
                    </MediumDialog>
                  )
              }
            })()}
          </div>
        </TabList>
        <TabPanel value={GroupDetailTabKey.Publication}>
          <PublicationPart
            toast={toast}
            list={publicationList}
            onArchive={onArchivePublication}
          />
        </TabPanel>
        <TabPanel value={GroupDetailTabKey.Creation}>
          <CreationPart
            toast={toast}
            list={creationList}
            onArchive={onArchiveCreation}
          />
        </TabPanel>
      </TabSection>
    </div>
  )
}

function GroupPart({
  toast: { push },
  group,
}: {
  toast: ToastAPI
  group: Group
}) {
  const intl = useIntl()
  const theme = useTheme()
  const logo = group.logo || group.owner?.picture

  //#region menu
  const handleDelete = useCallback(() => {
    // TODO
    push({
      type: 'warning',
      message: intl.formatMessage({ defaultMessage: '删除' }),
      description: intl.formatMessage({ defaultMessage: '功能暂未实现' }),
    })
  }, [intl, push])
  const handleSubscribe = useCallback(() => {
    // TODO
    push({
      type: 'warning',
      message: intl.formatMessage({ defaultMessage: '订阅' }),
      description: intl.formatMessage({ defaultMessage: '功能暂未实现' }),
    })
  }, [intl, push])
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
        {group.slogan && (
          <h2
            css={css`
              margin-bottom: 12px;
              ${theme.typography.h3}
            `}
          >
            {group.slogan}
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
              alt={group.name}
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
              { owner: group.owner?.name || group.name, count: 0 }
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
          <Button variant='outlined'>
            {intl.formatMessage({ defaultMessage: '编辑简介' })}
          </Button>
          <Menu anchor={IconMoreAnchor} items={menuItems} />
        </div>
      </div>
    </div>
  )
}

function PublicationPart({
  toast: { push },
  list,
  onArchive,
}: {
  toast: ToastAPI
  list: ReturnType<typeof usePublicationList>
  onArchive: (item: PublicationOutput) => void
}) {
  const intl = useIntl()
  const {
    items,
    isLoading,
    hasMore,
    loadMore,
    refresh,
    publishItem,
    archiveItem,
    isPublishing,
    isArchiving,
  } = list

  const isInitializedRef = useRef(false)
  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true
      refresh()
    }
  }, [refresh])

  const onPublish = useCallback(
    async (item: PublicationOutput) => {
      try {
        await publishItem(item)
        push({
          type: 'success',
          message: intl.formatMessage({ defaultMessage: '发布成功' }),
          description: intl.formatMessage(
            { defaultMessage: '已发布待审核：{title}' },
            { title: item.title }
          ),
        })
      } catch (error) {
        push({
          type: 'warning',
          message: intl.formatMessage({ defaultMessage: '发布失败' }),
          description: toMessage(error),
        })
      }
    },
    [intl, publishItem, push]
  )

  const handleArchive = useCallback(
    async (item: PublicationOutput) => {
      try {
        await archiveItem(item)
        push({
          type: 'success',
          message: intl.formatMessage({ defaultMessage: '归档成功' }),
          description: intl.formatMessage(
            { defaultMessage: '已归档文章：{title}' },
            { title: item.title }
          ),
        })
        onArchive(item)
      } catch (error) {
        push({
          type: 'warning',
          message: intl.formatMessage({ defaultMessage: '归档失败' }),
          description: toMessage(error),
        })
      }
    },
    [archiveItem, intl, onArchive, push]
  )

  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const handleClick = useCallback(
    (item: PublicationOutput) => {
      const searchParams2 = new URLSearchParams(searchParams)
      searchParams2.set('language', item.language)
      searchParams2.set('version', item.version.toString())
      navigate({
        pathname: generatePath(PUBLICATION_DETAIL_PATH, {
          gid: Xid.fromValue(item.gid).toString(),
          cid: Xid.fromValue(item.cid).toString(),
        }),
        search: searchParams2.toString(),
      })
    },
    [navigate, searchParams]
  )

  return (
    <div
      css={css`
        display: flex;
        flex-direction: column;
        gap: 24px;
      `}
    >
      {!isLoading && items.length === 0 ? (
        <Placeholder />
      ) : (
        items.map((item) => (
          <PublicationItem
            key={buildPublicationKey(item)}
            item={item}
            isPublishing={isPublishing(item)}
            isArchiving={isArchiving(item)}
            onClick={handleClick}
            onPublish={onPublish}
            onArchive={handleArchive}
          />
        ))
      )}
      <LoadMore isLoading={isLoading} hasMore={hasMore} loadMore={loadMore} />
    </div>
  )
}

function ArchivedPublicationPart({
  toast: { push },
  list,
  onRestore,
}: {
  toast: ToastAPI
  list: ReturnType<typeof usePublicationList>
  onRestore: (item: PublicationOutput) => void
}) {
  const intl = useIntl()
  const {
    items,
    isLoading,
    hasMore,
    loadMore,
    restoreItem,
    deleteItem,
    isRestoring,
    isDeleting,
  } = list

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => loadMore(), [])

  const handleRestore = useCallback(
    async (item: PublicationOutput) => {
      try {
        await restoreItem(item)
        push({
          type: 'success',
          message: intl.formatMessage({ defaultMessage: '恢复成功' }),
          description: intl.formatMessage(
            { defaultMessage: '已恢复文章：{title}' },
            { title: item.title }
          ),
        })
        onRestore(item)
      } catch (error) {
        push({
          type: 'warning',
          message: intl.formatMessage({ defaultMessage: '恢复失败' }),
          description: toMessage(error),
        })
      }
    },
    [intl, onRestore, push, restoreItem]
  )

  const onDelete = useCallback(
    async (item: PublicationOutput) => {
      try {
        await deleteItem(item)
        push({
          type: 'success',
          message: intl.formatMessage({ defaultMessage: '删除成功' }),
          description: intl.formatMessage(
            { defaultMessage: '已删除文章：{title}' },
            { title: item.title }
          ),
        })
      } catch (error) {
        push({
          type: 'warning',
          message: intl.formatMessage({ defaultMessage: '删除失败' }),
          description: toMessage(error),
        })
      }
    },
    [deleteItem, intl, push]
  )

  return (
    <div
      css={css`
        padding: 0 24px 24px;
        display: flex;
        flex-direction: column;
        gap: 24px;
      `}
    >
      {!isLoading && items.length === 0 ? (
        <Placeholder />
      ) : (
        items.map((item) => (
          <CompactPublicationItem
            key={buildPublicationKey(item)}
            item={item}
            isRestoring={isRestoring(item)}
            isDeleting={isDeleting(item)}
            onRestore={handleRestore}
            onDelete={onDelete}
          />
        ))
      )}
      <LoadMore
        isLoading={isLoading}
        hasMore={hasMore}
        loadMore={loadMore}
        css={css`
          margin-bottom: -24px;
        `}
      />
    </div>
  )
}

function CreationPart({
  toast: { push },
  list,
  onArchive,
}: {
  toast: ToastAPI
  list: ReturnType<typeof useCreationList>
  onArchive: (item: CreationOutput) => void
}) {
  const intl = useIntl()
  const {
    items,
    isLoading,
    hasMore,
    loadMore,
    refresh,
    releaseItem,
    archiveItem,
    isReleasing,
    isArchiving,
  } = list

  const isInitializedRef = useRef(false)
  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true
      refresh()
    }
  }, [refresh])

  const onRelease = useCallback(
    async (item: CreationOutput) => {
      try {
        await releaseItem(item)
        push({
          type: 'success',
          message: intl.formatMessage({ defaultMessage: '发布成功' }),
          description: intl.formatMessage(
            { defaultMessage: '已发布待审核：{title}' },
            { title: item.title }
          ),
        })
      } catch (error) {
        push({
          type: 'warning',
          message: intl.formatMessage({ defaultMessage: '发布失败' }),
          description: toMessage(error),
        })
      }
    },
    [intl, push, releaseItem]
  )

  const handleArchive = useCallback(
    async (item: CreationOutput) => {
      try {
        await archiveItem(item)
        push({
          type: 'success',
          message: intl.formatMessage({ defaultMessage: '归档成功' }),
          description: intl.formatMessage(
            { defaultMessage: '已归档文章：{title}' },
            { title: item.title }
          ),
        })
        onArchive(item)
      } catch (error) {
        push({
          type: 'warning',
          message: intl.formatMessage({ defaultMessage: '归档失败' }),
          description: toMessage(error),
        })
      }
    },
    [archiveItem, intl, onArchive, push]
  )

  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const handleClick = useCallback(
    (item: CreationOutput) => {
      navigate({
        pathname: generatePath(CREATION_DETAIL_PATH, {
          gid: Xid.fromValue(item.gid).toString(),
          cid: Xid.fromValue(item.id).toString(),
        }),
        search: searchParams.toString(),
      })
    },
    [navigate, searchParams]
  )

  return (
    <div
      css={css`
        display: flex;
        flex-direction: column;
        gap: 24px;
      `}
    >
      {!isLoading && items.length === 0 ? (
        <Placeholder />
      ) : (
        items.map((item) => (
          <CreationItem
            key={buildCreationKey(item)}
            item={item}
            isReleasing={isReleasing(item)}
            isArchiving={isArchiving(item)}
            onClick={handleClick}
            onRelease={onRelease}
            onArchive={handleArchive}
          />
        ))
      )}
      <LoadMore isLoading={isLoading} hasMore={hasMore} loadMore={loadMore} />
    </div>
  )
}

function ArchivedCreationPart({
  toast: { push },
  list,
  onRestore,
}: {
  toast: ToastAPI
  list: ReturnType<typeof useCreationList>
  onRestore: (item: CreationOutput) => void
}) {
  const intl = useIntl()
  const {
    items,
    isLoading,
    hasMore,
    loadMore,
    restoreItem,
    deleteItem,
    isRestoring,
    isDeleting,
  } = list

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => loadMore(), [])

  const handleRestore = useCallback(
    async (item: CreationOutput) => {
      try {
        await restoreItem(item)
        push({
          type: 'success',
          message: intl.formatMessage({ defaultMessage: '恢复成功' }),
          description: intl.formatMessage(
            { defaultMessage: '已恢复文章：{title}' },
            { title: item.title }
          ),
        })
        onRestore(item)
      } catch (error) {
        push({
          type: 'warning',
          message: intl.formatMessage({ defaultMessage: '恢复失败' }),
          description: toMessage(error),
        })
      }
    },
    [intl, onRestore, push, restoreItem]
  )

  const onDelete = useCallback(
    async (item: CreationOutput) => {
      try {
        await deleteItem(item)
        push({
          type: 'success',
          message: intl.formatMessage({ defaultMessage: '删除成功' }),
          description: intl.formatMessage(
            { defaultMessage: '已删除文章：{title}' },
            { title: item.title }
          ),
        })
      } catch (error) {
        push({
          type: 'warning',
          message: intl.formatMessage({ defaultMessage: '删除失败' }),
          description: toMessage(error),
        })
      }
    },
    [deleteItem, intl, push]
  )

  return (
    <div
      css={css`
        padding: 0 24px 24px;
        display: flex;
        flex-direction: column;
        gap: 24px;
      `}
    >
      {!isLoading && items.length === 0 ? (
        <Placeholder />
      ) : (
        items.map((item) => (
          <CompactCreationItem
            key={buildCreationKey(item)}
            item={item}
            isRestoring={isRestoring(item)}
            isDeleting={isDeleting(item)}
            onRestore={handleRestore}
            onDelete={onDelete}
          />
        ))
      )}
      <LoadMore
        isLoading={isLoading}
        hasMore={hasMore}
        loadMore={loadMore}
        css={css`
          margin-bottom: -24px;
        `}
      />
    </div>
  )
}
