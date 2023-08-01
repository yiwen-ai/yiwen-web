import { NEW_CREATION_PATH, SetHeaderProps } from '#/App'
import { css, useTheme } from '@emotion/react'
import {
  Avatar,
  Button,
  Icon,
  Menu,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabSection,
  useToast,
  type MenuItemProps,
  type ToastAPI,
} from '@yiwen-ai/component'
import {
  useCreationList,
  useFetcher,
  useMyDefaultGroup,
  usePublicationList,
  type CreationOutput,
  type Group,
  type PublicationOutput,
} from '@yiwen-ai/store'
import { type ModalRef } from '@yiwen-ai/util'
import { useCallback, useMemo, useRef } from 'react'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import { Xid } from 'xid-ts'

export default function GroupDetail() {
  const intl = useIntl()
  const toast = useToast()
  const group = useMyDefaultGroup()
  const fetcher = useFetcher()

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
            <Button variant='outlined'>
              {intl.formatMessage({ defaultMessage: '创作内容' })}
            </Button>
          </Link>
        </div>
      </SetHeaderProps>
      {!group ? (
        <div
          css={css`
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
          `}
        >
          <Spinner />
        </div>
      ) : (
        <div>
          <GroupPart toast={toast} group={group} />
          <TabSection
            defaultValue={TabKey.Creation}
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
              <Tab value={TabKey.Publication}>
                {intl.formatMessage({ defaultMessage: '发布' })}
              </Tab>
              <Tab value={TabKey.Creation}>
                {intl.formatMessage({ defaultMessage: '原稿' })}
              </Tab>
            </TabList>
            <TabPanel value={TabKey.Publication}>
              {fetcher && <PublicationPart group={group} fetcher={fetcher} />}
            </TabPanel>
            <TabPanel value={TabKey.Creation}>
              {fetcher && <CreationPart group={group} fetcher={fetcher} />}
            </TabPanel>
          </TabSection>
        </div>
      )}
    </>
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
  const menuRef = useRef<ModalRef>(null)
  const handleDelete = useCallback(() => {
    // TODO
    push({
      type: 'warning',
      message: intl.formatMessage({ defaultMessage: '删除' }),
      description: intl.formatMessage({ defaultMessage: '功能暂未实现' }),
    })
    menuRef.current?.close()
  }, [intl, push])
  const handleSubscribe = useCallback(() => {
    // TODO
    push({
      type: 'warning',
      message: intl.formatMessage({ defaultMessage: '订阅' }),
      description: intl.formatMessage({ defaultMessage: '功能暂未实现' }),
    })
    menuRef.current?.close()
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
        max-width: 1080px;
        margin: 0 auto;
        padding: 40px 24px;
        border-bottom: 1px solid ${theme.color.divider.primary};
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
          ref={menuRef}
          anchor={(props) => (
            <div
              {...props}
              css={css`
                display: flex;
                align-items: center;
                cursor: pointer;
              `}
            >
              <Icon name='more' />
            </div>
          )}
          items={menuItems}
        />
      </div>
    </div>
  )
}

enum TabKey {
  Publication = 'publication',
  Creation = 'creation',
}

function PublicationPart({
  group,
  fetcher,
}: {
  group: Group
  fetcher: NonNullable<ReturnType<typeof useFetcher>>
}) {
  const intl = useIntl()
  const theme = useTheme()
  const { items, isLoading, hasMore, loadMore } = usePublicationList(
    { gid: group.id },
    fetcher
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
        <div
          css={css`
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
            ${theme.typography.tooltip}
            color: ${theme.color.body.secondary};
          `}
        >
          {intl.formatMessage({ defaultMessage: '暂无数据，请稍后再试' })}
        </div>
      ) : (
        items.map((item) => (
          <PublicationItem
            key={`${Xid.fromValue(item.cid).toString()}:${item.version}`}
            item={item}
          />
        ))
      )}
      <div
        css={css`
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          :empty {
            display: none;
          }
        `}
      >
        {isLoading ? (
          <Spinner />
        ) : hasMore ? (
          <Button variant='outlined' onClick={loadMore}>
            {intl.formatMessage({ defaultMessage: '加载更多' })}
          </Button>
        ) : null}
      </div>
    </div>
  )
}

export function PublicationItem(props: { item: PublicationOutput }) {
  const intl = useIntl()
  const theme = useTheme()

  return (
    <div
      css={css`
        padding: 32px 40px;
        border: 1px solid ${theme.color.divider.primary};
        border-radius: 12px;
      `}
    >
      <div
        css={css`
          ${theme.typography.h3}
        `}
      >
        {props.item.title}
      </div>
      {props.item.summary && (
        <div
          css={css`
            margin-top: 12px;
          `}
        >
          {props.item.summary}
        </div>
      )}
      <div
        css={css`
          margin-top: 12px;
          display: flex;
          align-items: center;
          gap: 24px;
        `}
      >
        <Button
          color='primary'
          variant='outlined'
          size='small'
          css={css`
            gap: 8px;
          `}
        >
          <Icon name='edit' size='small' />
          <span>{intl.formatMessage({ defaultMessage: '编辑' })}</span>
        </Button>
      </div>
    </div>
  )
}

function CreationPart({
  group,
  fetcher,
}: {
  group: Group
  fetcher: NonNullable<ReturnType<typeof useFetcher>>
}) {
  const intl = useIntl()
  const theme = useTheme()
  const { items, isLoading, hasMore, loadMore } = useCreationList(
    { gid: group.id },
    fetcher
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
        <div
          css={css`
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
            ${theme.typography.tooltip}
            color: ${theme.color.body.secondary};
          `}
        >
          {intl.formatMessage({ defaultMessage: '暂无数据，请稍后再试' })}
        </div>
      ) : (
        items.map((item) => (
          <CreationItem key={Xid.fromValue(item.id).toString()} item={item} />
        ))
      )}
      <div
        css={css`
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          :empty {
            display: none;
          }
        `}
      >
        {isLoading ? (
          <Spinner />
        ) : hasMore ? (
          <Button variant='outlined' onClick={loadMore}>
            {intl.formatMessage({ defaultMessage: '加载更多' })}
          </Button>
        ) : null}
      </div>
    </div>
  )
}

export function CreationItem(props: { item: CreationOutput }) {
  const intl = useIntl()
  const theme = useTheme()

  const handleEdit = useCallback(() => {
    // TODO: edit creation
  }, [])

  return (
    <div
      css={css`
        padding: 32px 40px;
        border: 1px solid ${theme.color.divider.primary};
        border-radius: 12px;
      `}
    >
      <div
        css={css`
          ${theme.typography.h3}
        `}
      >
        {props.item.title}
      </div>
      {props.item.summary && (
        <div
          css={css`
            margin-top: 12px;
          `}
        >
          {props.item.summary}
        </div>
      )}
      <div
        css={css`
          margin-top: 12px;
          display: flex;
          align-items: center;
          gap: 24px;
        `}
      >
        <Button
          color='primary'
          variant='outlined'
          size='small'
          onClick={handleEdit}
          css={css`
            gap: 8px;
          `}
        >
          <Icon name='edit' size='small' />
          <span>{intl.formatMessage({ defaultMessage: '编辑' })}</span>
        </Button>
      </div>
    </div>
  )
}
