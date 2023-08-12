import { NEW_CREATION_PATH, SetHeaderProps } from '#/App'
import CompactCreationItem from '#/components/CompactCreationItem'
import CompactPublicationItem from '#/components/CompactPublicationItem'
import CreationItem from '#/components/CreationItem'
import LoadMore from '#/components/LoadMore'
import Loading from '#/components/Loading'
import MediumDialog from '#/components/MediumDialog'
import Placeholder from '#/components/Placeholder'
import PublicationItem from '#/components/PublicationItem'
import { css, useTheme } from '@emotion/react'
import {
  Avatar,
  Button,
  Icon,
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
  toMessage,
  useCreationList,
  useMyDefaultGroup,
  usePublicationList,
  type CreationOutput,
  type Group,
} from '@yiwen-ai/store'
import { type AnchorProps } from '@yiwen-ai/util'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import {
  Link,
  useLocation,
  useNavigate,
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
  const group = useMyDefaultGroup()
  const [params] = useSearchParams()
  const [tab, setTab] = useState(
    (params.get('tab') as GroupDetailTabKey | null) ??
      GroupDetailTabKey.Publication
  )
  const location = useLocation()
  const navigate = useNavigate()
  const updateTab = useCallback(
    (tab: GroupDetailTabKey) => {
      setTab(tab)
      const search = new URLSearchParams(location.search)
      search.set('tab', tab)
      navigate({ ...location, search: search.toString() }, { replace: true })
    },
    [location, navigate]
  )

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
            to={NEW_CREATION_PATH}
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
  const creationList = useCreationList({ gid: group.id })
  const archivedCreationList = useCreationList({
    gid: group.id,
    status: CreationStatus.Archived,
  })
  const { refresh: refreshCreationList } = creationList
  const { refresh: refreshArchivedCreationList } = archivedCreationList
  const onArchive = useCallback(
    () => refreshArchivedCreationList(),
    [refreshArchivedCreationList]
  )
  const onRestore = useCallback(
    () => refreshCreationList(),
    [refreshCreationList]
  )

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
                      <ArchivedPublicationPart toast={toast} group={group} />
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
                        onRestore={onRestore}
                      />
                    </MediumDialog>
                  )
              }
            })()}
          </div>
        </TabList>
        <TabPanel value={GroupDetailTabKey.Publication}>
          <PublicationPart group={group} />
        </TabPanel>
        <TabPanel value={GroupDetailTabKey.Creation}>
          <CreationPart
            toast={toast}
            list={creationList}
            onArchive={onArchive}
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
          <Menu
            anchor={(props) => (
              <Icon
                name='more'
                {...props}
                css={css`
                  cursor: pointer;
                `}
              />
            )}
            items={menuItems}
          />
        </div>
      </div>
    </div>
  )
}

function PublicationPart({ group }: { group: Group }) {
  const { items, isLoading, hasMore, loadMore } = usePublicationList({
    gid: group.id,
  })

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
            key={`${Xid.fromValue(item.cid).toString()}:${item.version}`}
            item={item}
          />
        ))
      )}
      <LoadMore isLoading={isLoading} hasMore={hasMore} loadMore={loadMore} />
    </div>
  )
}

function ArchivedPublicationPart({ group }: { toast: ToastAPI; group: Group }) {
  const { items, isLoading, hasMore, loadMore } = usePublicationList({
    gid: group.id,
    status: PublicationStatus.Archived,
  })

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
            key={`${Xid.fromValue(item.cid).toString()}:${item.version}`}
            item={item}
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
    releaseItem,
    archiveItem,
    isReleasing,
    isArchiving,
  } = list

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => loadMore(), [])

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
            key={Xid.fromValue(item.id).toString()}
            item={item}
            isReleasing={isReleasing(item)}
            isArchiving={isArchiving(item)}
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
            key={Xid.fromValue(item.id).toString()}
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
