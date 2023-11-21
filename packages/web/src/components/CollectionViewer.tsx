import { GROUP_DETAIL_PATH, ThemeContext } from '#/App'
import CreatedBy from '#/components/CreatedBy'
import { LargeDialogContext } from '#/components/LargeDialog'
import { LoadMore } from '#/components/LoadMore'
import Placeholder from '#/components/Placeholder'
import PublicationSelector from '#/components/PublicationSelector'
import { BREAKPOINT, MAX_WIDTH } from '#/shared'
import { useCollectionChildrenViewer } from '#/store/useCollectionChildrenViewer'
import { GroupViewType } from '#/store/useGroupDetailPage'
import { css, useTheme } from '@emotion/react'
import {
  Button,
  Clickable,
  Icon,
  IconButton,
  Menu,
  MenuItem,
  QRCode,
  Select,
  SelectOption,
  SelectOptionGroup,
  Spinner,
  TextField,
  textEllipsis,
  type ToastAPI,
} from '@yiwen-ai/component'
import {
  ObjectKind,
  getCollectionInfo,
  isRTL,
  type CollectionChildrenOutput,
  type CollectionOutput,
  type QueryPaymentCode,
  type UILanguageItem,
} from '@yiwen-ai/store'
import { preventDefaultStopPropagation } from '@yiwen-ai/util'
import { escapeRegExp } from 'lodash-es'
import {
  useCallback,
  useContext,
  useMemo,
  useState,
  type HTMLAttributes,
} from 'react'
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DraggableProvided,
  type DraggableStateSnapshot,
  type OnDragEndResponder,
} from 'react-beautiful-dnd'
import { useIntl } from 'react-intl'
import { useResizeDetector } from 'react-resize-detector'
import { Link, generatePath } from 'react-router-dom'
import { Xid } from 'xid-ts'
import ChargeDialog, { type ChargeDialogProps } from './ChargeDialog'
import ErrorPlaceholder from './ErrorPlaceholder'
import Loading from './Loading'
import PaymentConfirmDialog from './PaymentConfirmDialog'

export interface CollectionViewerProps extends HTMLAttributes<HTMLDivElement> {
  pushToast: ToastAPI['pushToast']
  responsive: boolean
  isLoading: boolean
  hasGroupAdminPermission?: boolean
  error: unknown
  collection: CollectionOutput | undefined
  currentLanguage: UILanguageItem | undefined
  originalLanguage: UILanguageItem | undefined
  translatedLanguageList: UILanguageItem[] | undefined
  pendingLanguageList: UILanguageItem[] | undefined
  refreshCollection: () => void
  onCharge: () => void
  onSwitch: (language: UILanguageItem) => void
  shareLink: string | undefined
  onShare: () => void
  isFavorite: boolean
  isAddingFavorite: boolean
  isRemovingFavorite: boolean
  onAddFavorite: () => void
  onRemoveFavorite: () => void
  onClose?: () => void
  chargeDialog: ChargeDialogProps
}

export default function CollectionViewer({
  pushToast,
  responsive,
  isLoading,
  hasGroupAdminPermission,
  error,
  collection,
  currentLanguage,
  originalLanguage,
  translatedLanguageList: _translatedLanguageList,
  pendingLanguageList: _pendingLanguageList,
  refreshCollection,
  onCharge,
  onSwitch,
  shareLink,
  onShare,
  isFavorite,
  isAddingFavorite,
  isRemovingFavorite,
  onAddFavorite,
  onRemoveFavorite,
  onClose,
  chargeDialog,
  ...props
}: CollectionViewerProps) {
  const intl = useIntl()
  const theme = useTheme()
  // const { user } = useAuth()
  const { width = 0, ref } = useResizeDetector<HTMLDivElement>()
  const setTheme = useContext(ThemeContext)
  const isNarrow = responsive && width <= BREAKPOINT.small

  const [keyword, setKeyword] = useState('')
  const keywordRE = useMemo(
    () => new RegExp(escapeRegExp(keyword), 'i'),
    [keyword]
  )
  const handleKeywordChange = useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      setKeyword(ev.currentTarget.value)
    },
    []
  )

  const translatedLanguageList = useMemo(() => {
    return _translatedLanguageList?.filter((item) => {
      return (
        keywordRE.test(item.code) ||
        keywordRE.test(item.name) ||
        keywordRE.test(item.nativeName)
      )
    })
  }, [_translatedLanguageList, keywordRE])

  return (
    <div
      {...props}
      ref={ref}
      css={css`
        flex: 1;
        display: flex;
        flex-direction: column;
      `}
    >
      {isLoading ? (
        <Loading />
      ) : error ? (
        <ErrorPlaceholder error={error} />
      ) : collection ? (
        <>
          <div
            css={css`
              padding: 36px;
              display: flex;
              align-items: flex-start;
              gap: 24px;
              @media (max-width: ${BREAKPOINT.small}px) {
                padding: 16px;
                gap: 16px;
                box-shadow: ${theme.effect.card};
              }
            `}
          >
            <div
              css={css`
                flex: 1;
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                gap: inherit;
                > button:last-of-type {
                  margin-right: auto;
                }
              `}
            >
              <Button
                title={intl.formatMessage({ defaultMessage: '创作语言' })}
                color='primary'
                variant='outlined'
                size={isNarrow ? 'small' : 'large'}
                disabled={!originalLanguage || originalLanguage.isCurrent}
                onClick={
                  originalLanguage
                    ? () => onSwitch(originalLanguage)
                    : undefined
                }
              >
                {!originalLanguage && <Spinner size='small' />}
                {originalLanguage?.nativeName}
              </Button>
              {!currentLanguage || currentLanguage.isOriginal ? null : (
                <Button
                  title={intl.formatMessage({
                    defaultMessage: '当前语言',
                  })}
                  color='primary'
                  variant='outlined'
                  size={isNarrow ? 'small' : 'large'}
                >
                  {currentLanguage.nativeName}
                </Button>
              )}
              {translatedLanguageList && (
                <Select
                  anchor={(props) => (
                    <Button
                      color='secondary'
                      size={isNarrow ? 'small' : 'large'}
                      {...props}
                    >
                      (
                      <Icon
                        name='translate3'
                        size={isNarrow ? 'small' : 'medium'}
                      />
                      )
                      {isNarrow ? null : (
                        <span css={textEllipsis}>
                          {intl.formatMessage({
                            defaultMessage: '更多语言',
                          })}
                        </span>
                      )}
                    </Button>
                  )}
                  css={css`
                    width: 300px;
                  `}
                >
                  <li
                    role='none'
                    css={css`
                      display: flex;
                      flex-direction: column;
                    `}
                  >
                    <TextField
                      size='large'
                      placeholder={intl.formatMessage({
                        defaultMessage: '搜索语言',
                      })}
                      value={keyword}
                      onChange={handleKeywordChange}
                    />
                  </li>
                  {originalLanguage && (
                    <SelectOption
                      key={originalLanguage.code}
                      label={intl.formatMessage(
                        { defaultMessage: '{name} (创作语言)' },
                        { name: originalLanguage.nativeName }
                      )}
                      value={originalLanguage.code}
                      dir={originalLanguage.dir}
                      onSelect={() => onSwitch(originalLanguage)}
                    />
                  )}
                  {translatedLanguageList.length > 0 && (
                    <SelectOptionGroup
                      label={intl.formatMessage({ defaultMessage: '已翻译' })}
                    >
                      {translatedLanguageList.map((item) => (
                        <SelectOption
                          key={item.code}
                          after={item.isProcessing && <Spinner size='small' />}
                          label={`${item.nativeName} (${item.name})`}
                          value={item.code}
                          dir={item.dir}
                          onSelect={() => onSwitch(item)}
                        />
                      ))}
                    </SelectOptionGroup>
                  )}
                </Select>
              )}
              <div
                css={css`
                  display: flex;
                  flex-wrap: wrap;
                  align-items: center;
                  gap: 24px;
                  @media (max-width: ${BREAKPOINT.small}px) {
                    gap: 16px;
                  }
                `}
              >
                {isNarrow && (
                  <IconButton
                    iconName='celo'
                    onClick={setTheme}
                    css={css`
                      color: ${theme.color.body.default};
                    `}
                  />
                )}
                {isNarrow ? (
                  <IconButton
                    iconName='heart3'
                    color={isFavorite ? 'primary' : 'secondary'}
                    disabled={isAddingFavorite || isRemovingFavorite}
                    onClick={isFavorite ? onRemoveFavorite : onAddFavorite}
                  />
                ) : (
                  <Button
                    color={isFavorite ? 'primary' : 'secondary'}
                    variant='outlined'
                    disabled={isAddingFavorite || isRemovingFavorite}
                    onClick={isFavorite ? onRemoveFavorite : onAddFavorite}
                  >
                    {isAddingFavorite || isRemovingFavorite ? (
                      <Spinner size='small' />
                    ) : (
                      <Icon name='heart' size='small' />
                    )}
                    {isFavorite
                      ? intl.formatMessage({ defaultMessage: '已加入书签' })
                      : intl.formatMessage({ defaultMessage: '添加书签' })}
                  </Button>
                )}
                {shareLink ? (
                  <Menu
                    anchor={(props) =>
                      isNarrow ? (
                        <IconButton iconName='directright2' {...props} />
                      ) : (
                        <Button color='secondary' {...props}>
                          <Icon name='directright' size='small' />
                          {intl.formatMessage({ defaultMessage: '分享' })}
                        </Button>
                      )
                    }
                  >
                    <MenuItem
                      label={intl.formatMessage({ defaultMessage: '复制链接' })}
                      onClick={onShare}
                    />
                    <MenuItem
                      label={
                        <span
                          css={css`
                            display: flex;
                            align-items: center;
                            gap: 8px;
                          `}
                        >
                          {intl.formatMessage({ defaultMessage: '分享到微信' })}
                          <Icon name='wechat' size='small' />
                        </span>
                      }
                      description={
                        <QRCode
                          value={shareLink}
                          css={css`
                            width: 80px;
                            padding: 2px;
                            box-sizing: border-box;
                            border-radius: 2px;
                            background: ${theme.color.menu.item.hover
                              .background};
                          `}
                        />
                      }
                      readOnly={true}
                    />
                  </Menu>
                ) : null}
              </div>
            </div>
            {onClose && (
              <div
                css={css`
                  height: ${isNarrow ? undefined : '40px'};
                  display: flex;
                  align-items: center;
                `}
              >
                <IconButton
                  aria-label={intl.formatMessage({ defaultMessage: '关闭' })}
                  iconName='closecircle2'
                  size={isNarrow ? 'small' : 'medium'}
                  variant='contained'
                  onClick={onClose}
                />
              </div>
            )}
          </div>
          {collection && (
            <CollectionDetail
              pushToast={pushToast}
              collection={collection}
              refreshCollection={refreshCollection}
              onCharge={onCharge}
              hasGroupAdminPermission={hasGroupAdminPermission || false}
              isNarrow={isNarrow}
            ></CollectionDetail>
          )}
        </>
      ) : null}
      <ChargeDialog {...chargeDialog} />
    </div>
  )
}

function CollectionDetail({
  pushToast,
  collection,
  refreshCollection,
  onCharge,
  hasGroupAdminPermission,
  isNarrow,
}: {
  pushToast: ToastAPI['pushToast']
  collection: CollectionOutput
  refreshCollection: () => void
  onCharge: () => void
  hasGroupAdminPermission: boolean
  isNarrow: boolean
}) {
  const intl = useIntl()
  const theme = useTheme()
  const switchFullScreen = useContext(LargeDialogContext)
  const [isEditing, setIsEditing] = useState(false)
  const [language, info] = useMemo(() => {
    return getCollectionInfo(collection)
  }, [collection])

  const dir = useMemo(() => {
    return isRTL(language) ? 'rtl' : undefined
  }, [language])

  const handleEditChildrenClick = useCallback(() => {
    setIsEditing(!isEditing)
    switchFullScreen(!isEditing)
  }, [isEditing, setIsEditing, switchFullScreen])

  const [payFor, setPayFor] = useState<Record<
    keyof QueryPaymentCode,
    string
  > | null>(null)
  const [paymentDisabled, setPaymentDisabled] = useState(false)

  const handlePaymentClose = useCallback(() => {
    setPayFor(null)
  }, [setPayFor])

  const handlePayForCollection = useCallback(() => {
    if (!collection || !collection?.rfp?.collection) return
    setPayFor({
      gid: Xid.fromValue(collection.gid).toString(),
      cid: Xid.fromValue(collection.id).toString(),
      kind: '2', // pay for collection
    })
  }, [collection, setPayFor])

  const handleCheckSubscription = useCallback(() => {
    refreshCollection()
  }, [refreshCollection])

  return (
    info && (
      <div
        css={css`
          width: 100%;
          max-width: calc(${MAX_WIDTH} + 36px * 2);
          margin: 0 auto;
          padding: 0 36px;
          box-sizing: border-box;
          height: calc(100vh - 160px);
          overflow-y: auto;
          @media (max-width: ${BREAKPOINT.small}px) {
            padding: 0 16px;
            height: calc(100vh - 60px);
          }
        `}
      >
        <div
          css={css`
            margin-top: 60px;
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            @media (max-width: ${BREAKPOINT.small}px) {
              margin-top: 24px;
            }
          `}
        >
          <img
            src={
              (collection.cover as string) ||
              'https://cdn.yiwen.pub/yiwen.cover.png'
            }
            alt='Cover'
            css={css`
              display: block;
              width: 160px;
              height: 210px;
              border-radius: 4px;
              border: 1px solid ${theme.color.divider.secondary};
              object-fit: contain;
              background-color: ${theme.color.divider.secondary};
              box-shadow: ${theme.effect.card};
              @media (max-width: ${BREAKPOINT.small}px) {
                width: 120px;
                height: 160px;
              }
            `}
          ></img>
          <div
            css={css`
              display: flex;
              flex-direction: column;
              gap: 12px;
              margin-left: 24px;
              width: calc(${MAX_WIDTH} + 36px * 2 - 160px - 24px);
            `}
          >
            <div
              dir={dir}
              css={css`
                ${theme.typography.h2}
              `}
            >
              {info.title}
            </div>
            {info.summary && <div dir={dir}>{info.summary}</div>}
            {collection.group_info && (
              <Link
                to={{
                  pathname: generatePath(GROUP_DETAIL_PATH, {
                    gid: Xid.fromValue(collection.gid).toString(),
                    type: GroupViewType.Collection,
                  }),
                }}
                css={css`
                  display: flex;
                  width: fit-content;
                  max-width: 100%;
                `}
              >
                <CreatedBy
                  item={collection.group_info}
                  timestamp={collection.updated_at || 0}
                />
              </Link>
            )}
            {(collection.rfp || collection.subscription) && (
              <>
                <Button
                  color={collection.rfp ? 'primary' : 'secondary'}
                  variant='contained'
                  disabled={!collection.rfp}
                  size={isNarrow ? 'small' : 'medium'}
                  onClick={handlePayForCollection}
                  css={css`
                    width: fit-content;
                    :disabled {
                      border-color: ${theme.color.alert.success.border};
                      background-color: ${theme.color.alert.success.border};
                      color: white;
                    }
                  `}
                >
                  {collection.rfp?.collection && (
                    <>
                      <span>
                        {intl.formatMessage({ defaultMessage: '付费阅读' })}
                      </span>
                      <span>
                        {intl.formatMessage(
                          { defaultMessage: '{amount} 文' },
                          { amount: collection.rfp.collection.price }
                        )}
                      </span>
                    </>
                  )}
                  {collection.subscription &&
                    collection.subscription.expire_at > 0 && (
                      <>
                        <span>
                          {intl.formatMessage({
                            defaultMessage: '已付费',
                          })}
                        </span>
                        <span>
                          {intl.formatMessage({
                            defaultMessage: '有效期至',
                          }) +
                            new Date(
                              collection.subscription.expire_at * 1000
                            ).toLocaleDateString()}
                        </span>
                      </>
                    )}
                </Button>
                {collection.rfp?.collection && (
                  <PaymentConfirmDialog
                    pushToast={pushToast}
                    onClose={handlePaymentClose}
                    disabled={paymentDisabled}
                    setDisabled={setPaymentDisabled}
                    payFor={payFor}
                    onCharge={onCharge}
                    checkSubscription={handleCheckSubscription}
                  />
                )}
              </>
            )}
            {hasGroupAdminPermission && !isNarrow && (
              <>
                <Button
                  color='primary'
                  variant='outlined'
                  onClick={handleEditChildrenClick}
                  css={css`
                    width: fit-content;
                  `}
                >
                  {isEditing
                    ? intl.formatMessage({ defaultMessage: '退出管理模式' })
                    : intl.formatMessage({ defaultMessage: '进入管理模式' })}
                </Button>
              </>
            )}
          </div>
        </div>
        <CollectionChildren
          pushToast={pushToast}
          collection={collection}
          dir={dir}
          isEditing={isEditing}
        ></CollectionChildren>
      </div>
    )
  )
}

function CollectionChildren({
  pushToast,
  collection,
  dir,
  isEditing,
}: {
  pushToast: ToastAPI['pushToast']
  collection: CollectionOutput
  dir: string | undefined
  isEditing: boolean
}) {
  const intl = useIntl()
  const theme = useTheme()

  const parent = Xid.fromValue(collection.id).toString()
  const gid = Xid.fromValue(collection.gid).toString()

  const {
    items,
    isLoading,
    isValidating,
    hasMore,
    loadMore,
    refresh,
    addChildren,
    updateChild,
    removeChild,
  } = useCollectionChildrenViewer(pushToast, gid, parent)

  const excludes = useMemo(() => {
    return items.map((item) => Xid.fromValue(item.cid).toString())
  }, [items])

  const onRemove = useCallback(
    (item: CollectionChildrenOutput) => {
      removeChild({
        gid: Xid.fromValue(item.gid).toString(),
        id: Xid.fromValue(item.parent).toString(),
        cid: Xid.fromValue(item.cid).toString(),
      })
    },
    [removeChild]
  )

  const handleLoadMore = useCallback(() => {
    loadMore()
  }, [loadMore])

  const handleDragEnd: OnDragEndResponder = useCallback(
    (result) => {
      const { source, destination } = result
      // dropped outside the list
      if (!destination) {
        return
      }

      const src = items[source.index]
      const dest = items[destination.index]
      if (!src || !dest || source.index == destination.index) {
        return
      }

      // update order to view
      if (source.index < destination.index) {
        for (let i = source.index; i < destination.index; i++) {
          items[i] = items[i + 1] as CollectionChildrenOutput
        }
      } else {
        for (let i = source.index; i > destination.index; i--) {
          items[i] = items[i - 1] as CollectionChildrenOutput
        }
      }
      items[destination.index] = src

      // update order to server
      const prevOrder =
        items[destination.index - 1]?.ord ||
        (items[destination.index + 1]?.ord || 1) - 1
      const nextOrder = items[destination.index + 1]?.ord || prevOrder + 1
      updateChild({
        gid: src.gid,
        id: src.parent,
        cid: src.cid,
        ord: (prevOrder + nextOrder) / 2,
      })
    },
    [items, updateChild]
  )

  const [openPublicationSelector, setOpenPublicationSelector] = useState(false)
  const [selected, setSelected] = useState<string[]>([])

  const showPublicationSelector = useCallback(() => {
    setOpenPublicationSelector(true)
  }, [setOpenPublicationSelector])

  const handlePublicationSelectorClose = useCallback(() => {
    setOpenPublicationSelector(false)
    setSelected([])
  }, [setOpenPublicationSelector])

  const [isSaving, setIsSaving] = useState(false)
  const handlePublicationSelectorSubmit = useCallback(async () => {
    setIsSaving(true)
    try {
      await addChildren({
        gid: collection.gid,
        id: collection.id,
        cids: selected.map((id) => Xid.fromValue(id).toBytes()),
        kind: ObjectKind.Publication,
      })
    } finally {
      setOpenPublicationSelector(false)
      setIsSaving(false)
      setSelected([])
      refresh()
    }
  }, [collection, selected, setIsSaving, addChildren, refresh])

  const containerCss = useMemo(
    () => css`
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: flex-start;
      gap: 16px;
      margin: 0;
      padding: 0;
      width: 100%;
      list-style: none;
      li {
        padding: 0px;
        height: 60px;
        width: max-content;
        min-width: 23%;
        max-width: 100%;
        transition: height 0.4s ease-in-out;
        @media (max-width: ${BREAKPOINT.small}px) {
          height: 48px;
        }
        ${isEditing &&
        css`
          height: 40px;
        `}
      }
      li > a {
        position: relative;
        ${textEllipsis}
        display: inline-block;
        padding: 0 24px;
        height: 100%;
        line-height: 60px;
        width: calc(100% - 24px * 2);
        border-radius: 12px;
        box-shadow: ${theme.effect.card};
        :hover {
          box-shadow: ${theme.effect.cardHover};
        }
        @media (max-width: ${BREAKPOINT.small}px) {
          padding: 0 16px;
          border-radius: 8px;
          width: calc(100% - 16px * 2);
          line-height: 48px;
        }
        ${isEditing &&
        css`
          padding: 0 24px 0 20px;
          line-height: 40px;
        `}
      }
    `,
    [isEditing, theme]
  )

  return (
    <div
      css={css`
        margin: 36px auto;
        @media (max-width: ${BREAKPOINT.small}px) {
          margin: 24px auto;
        }
      `}
    >
      {isLoading ? (
        <Loading />
      ) : items ? (
        <>
          {isEditing ? (
            <>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable
                  key={parent}
                  droppableId={parent}
                  ignoreContainerClipping={true}
                >
                  {(draProvided, _draSnapshot) => (
                    <ul
                      dir={dir}
                      ref={draProvided.innerRef}
                      {...draProvided.droppableProps}
                      css={containerCss}
                    >
                      {items.map((item, index) => {
                        const cid = Xid.fromValue(item.cid).toString()
                        return (
                          <Draggable key={cid} draggableId={cid} index={index}>
                            {(provided, snapshot) => (
                              <ChildItem
                                item={item}
                                gid={gid}
                                parent={parent}
                                isEditing={isEditing}
                                onRemove={onRemove}
                                provided={provided}
                                snapshot={snapshot}
                              ></ChildItem>
                            )}
                          </Draggable>
                        )
                      })}
                      {draProvided.placeholder}
                    </ul>
                  )}
                </Droppable>
              </DragDropContext>
              <Clickable
                onClick={showPublicationSelector}
                css={css`
                  display: inline-flex;
                  align-items: center;
                  justify-content: center;
                  margin-top: 12px;
                  padding: 12px 0px;
                  color: ${theme.color.body.primary};
                `}
              >
                <Icon name='add' size='medium' />
                <span>
                  {intl.formatMessage({
                    defaultMessage: '添加内容',
                  })}
                </span>
              </Clickable>
              <PublicationSelector
                open={openPublicationSelector}
                gid={gid}
                excludes={excludes}
                selected={selected}
                setSelected={setSelected}
                isSaving={isSaving}
                onClose={handlePublicationSelectorClose}
                onSave={handlePublicationSelectorSubmit}
              />
            </>
          ) : (
            <ul dir={dir} css={containerCss}>
              {items.map((item) => (
                <ChildItem
                  key={Xid.fromValue(item.cid).toString()}
                  item={item}
                  gid={gid}
                  parent={parent}
                  isEditing={isEditing}
                ></ChildItem>
              ))}
            </ul>
          )}
          <LoadMore
            hasMore={hasMore}
            isLoadingMore={isValidating}
            onLoadMore={handleLoadMore}
            css={css`
              width: 100%;
            `}
          />
        </>
      ) : (
        <Placeholder />
      )}
    </div>
  )
}

function ChildItem({
  item,
  gid,
  parent,
  isEditing,
  onRemove,
  provided,
  snapshot,
}: {
  item: CollectionChildrenOutput
  gid: string
  parent: string
  isEditing: boolean
  onRemove?: (item: CollectionChildrenOutput) => void
  provided?: DraggableProvided
  snapshot?: DraggableStateSnapshot
}) {
  const theme = useTheme()
  const cid = Xid.fromValue(item.cid).toString()
  const [isRemove, setIsRemove] = useState(false)
  const handleRemove = useCallback(() => {
    if (onRemove) {
      setIsRemove(true)
      setTimeout(() => onRemove(item), 200)
    }
  }, [item, onRemove, setIsRemove])

  return (
    <li
      key={cid}
      ref={provided?.innerRef}
      {...provided?.draggableProps}
      {...provided?.dragHandleProps}
      css={
        isRemove &&
        css`
          transform: scale(0);
          height: 0px !important;
        `
      }
    >
      <Link
        unstable_viewTransition={true}
        key={cid}
        onClick={isEditing ? preventDefaultStopPropagation : undefined}
        to={{
          pathname: generatePath(GROUP_DETAIL_PATH, {
            gid: gid as string,
            type:
              item.kind === ObjectKind.Collection
                ? GroupViewType.Collection
                : GroupViewType.Publication,
          }),
          search:
            item.kind === ObjectKind.Collection
              ? new URLSearchParams(cid).toString()
              : new URLSearchParams({
                  parent: parent as string,
                  cid,
                  language: item.language,
                  version: String(item.version),
                }).toString(),
        }}
        style={{
          backgroundColor: snapshot?.isDragging
            ? theme.palette.grayLight0
            : undefined,
        }}
      >
        {isEditing && (
          <Icon
            name='draggable'
            size='small'
            css={css`
              position: absolute;
              left: 4px;
              top: 12px;
            `}
          />
        )}
        {item.title}
        {isEditing && (
          <IconButton
            iconName='delete'
            size='medium'
            onClick={handleRemove}
            css={css`
              position: absolute;
              right: 4px;
              top: 4px;
              color: ${theme.color.body.default};
            `}
          />
        )}
      </Link>
    </li>
  )
}
