import { GROUP_DETAIL_PATH, ThemeContext } from '#/App'
import CollectionChildrenViewer from '#/components/CollectionChildrenViewer'
import CreatedBy from '#/components/CreatedBy'
import CreationSettingDialog from '#/components/CreationSettingDialog'
import LargeDialog, {
  LargeDialogBodyRefContext,
  LargeDialogContext,
} from '#/components/LargeDialog'
import { LoadMore } from '#/components/LoadMore'
import Placeholder from '#/components/Placeholder'
import PublicationSelector from '#/components/PublicationSelector'
import PublicationSettingDialog from '#/components/PublicationSettingDialog'
import { BREAKPOINT, MAX_WIDTH } from '#/shared'
import { useCollectionChildrenViewer } from '#/store/useCollectionChildrenViewer'
import { useCreationSettingDialog } from '#/store/useCreationSettingDialog'
import { GroupViewType } from '#/store/useGroupDetailPage'
import { usePublicationSettingDialog } from '#/store/usePublicationSettingDialog'
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
  CollectionStatus,
  ObjectKind,
  genFullChildTitle,
  getCollectionInfo,
  isRTL,
  useCollectionAPI,
  useCollectionBookmarkList,
  useCreationAPI,
  usePublicationAPI,
  useReadPublicationByJob,
  type CollectionChildrenOutput,
  type CollectionOutput,
  type PublicationOutput,
  type QueryPaymentCode,
  type UILanguageItem,
} from '@yiwen-ai/store'
import {
  preventDefaultStopPropagation,
  useScrollOnBottom,
  type ModalRef,
} from '@yiwen-ai/util'
import { escapeRegExp, some } from 'lodash-es'
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
import CollectionItemStatus from './CollectionItemStatus'
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

  const selectorRef = useRef<ModalRef>(null)
  const handleOnSwitch = useCallback(
    (value: UILanguageItem, _ev: React.SyntheticEvent) => {
      onSwitch(value)
      selectorRef.current?.close()
    },
    [onSwitch]
  )

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
                  ref={selectorRef}
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
                      value={originalLanguage}
                      dir={originalLanguage.dir}
                      onSelect={handleOnSwitch}
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
                          value={item}
                          dir={item.dir}
                          onSelect={handleOnSwitch}
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
              shareLink={shareLink}
              onShare={onShare}
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
  shareLink,
  onShare,
}: {
  pushToast: ToastAPI['pushToast']
  collection: CollectionOutput
  refreshCollection: () => void
  onCharge: () => void
  hasGroupAdminPermission: boolean
  isNarrow: boolean
  shareLink: string | undefined
  onShare: () => void
}) {
  const intl = useIntl()
  const theme = useTheme()
  const switchFullScreen = useContext(LargeDialogContext)
  const [editing, setEditing] = useState(0)
  const [language, info] = useMemo(() => {
    return getCollectionInfo(collection)
  }, [collection])

  const dir = isRTL(language) ? 'rtl' : undefined
  const handleEditChildrenClick = useCallback(() => {
    setEditing(editing == 0 ? 1 : 0)
    switchFullScreen(editing == 0)
  }, [editing, setEditing, switchFullScreen])

  const handleDragStart = useCallback(
    () => setEditing((v) => (v == 1 ? 2 : 1)),
    [setEditing]
  )

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
          @media (max-width: ${BREAKPOINT.small}px) {
            padding: 0 16px;
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
              margin-top: 12px;
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
              min-height: 210px;
              max-height: 250px;
              border-radius: 4px;
              object-fit: contain;
              background-color: ${theme.color.divider.secondary};
              box-shadow: ${theme.effect.card};
              @media (max-width: ${BREAKPOINT.small}px) {
                width: 120px;
                min-height: 160px;
                max-height: 210px;
              }
            `}
          ></img>
          <div
            css={css`
              display: flex;
              flex-direction: column;
              gap: 8px;
              margin-left: 24px;
              width: calc(${MAX_WIDTH} + 36px * 2 - 160px - 24px);
              @media (max-width: ${BREAKPOINT.small}px) {
                margin-left: 12px;
                width: calc(100% - 132px);
              }
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
            {info.authors && info.authors.length > 0 && (
              <div
                dir={dir}
                css={css`
                  display: flex;
                  align-items: center;
                  gap: 12px;
                  flex-wrap: wrap;
                  flex-direction: row;
                `}
              >
                {info.authors.map((author) => (
                  <Button
                    key={author}
                    color='primary'
                    variant='text'
                    size='medium'
                    readOnly={true}
                  >
                    {author}
                  </Button>
                ))}
              </div>
            )}
            {info.keywords && info.keywords.length > 0 && (
              <div
                dir={dir}
                css={css`
                  display: flex;
                  align-items: center;
                  gap: 12px;
                  flex-wrap: wrap;
                  flex-direction: row;

                  span {
                    padding: 4px 8px;
                    border-radius: 12px;
                    background-color: ${theme.color.divider.secondary};
                    ${theme.typography.tooltip};
                  }
                `}
              >
                {info.keywords.map((keyword) => (
                  <Button
                    key={keyword}
                    color='secondary'
                    size='small'
                    variant='contained'
                    readOnly={true}
                  >
                    {keyword}
                  </Button>
                ))}
              </div>
            )}
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
                  css={css`
                    flex-wrap: wrap;
                    ${isNarrow && theme.typography.tooltip};
                  `}
                />
              </Link>
            )}
            {(collection.rfp || collection.subscription) && (
              <>
                <Button
                  color={collection.rfp ? 'primary' : 'secondary'}
                  variant='contained'
                  disabled={!collection.rfp}
                  size={
                    isNarrow &&
                    collection.subscription &&
                    collection.subscription.expire_at > 0
                      ? 'small'
                      : 'medium'
                  }
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
                        {intl.formatMessage({ defaultMessage: '付费阅读' }) +
                          ' - ' +
                          intl.formatMessage(
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
                            ' ' +
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
              <div
                css={css`
                  display: flex;
                  flex-direction: row;
                  gap: 12px;
                  width: fit-content;
                `}
              >
                <Button
                  color='primary'
                  variant='outlined'
                  onClick={handleEditChildrenClick}
                  css={css`
                    width: fit-content;
                  `}
                >
                  {editing > 0
                    ? intl.formatMessage({ defaultMessage: '退出管理模式' })
                    : intl.formatMessage({ defaultMessage: '进入管理模式' })}
                </Button>
                {editing > 0 && (
                  <IconButton
                    iconName='draggable'
                    size='medium'
                    shape='rounded'
                    variant='contained'
                    color={editing > 1 ? 'primary' : 'secondary'}
                    onClick={handleDragStart}
                  />
                )}
              </div>
            )}
          </div>
        </div>
        {info.summary && (
          <p
            dir={dir}
            css={css`
              margin-top: 24px;
              text-indent: 2em;
              @media (max-width: ${BREAKPOINT.small}px) {
                margin-top: 12px;
              }
            `}
          >
            {info.summary}
          </p>
        )}
        <CollectionChildren
          pushToast={pushToast}
          collection={collection}
          title={info.title}
          language={language}
          editing={editing}
          shareLink={shareLink}
          onShare={onShare}
          onCharge={onCharge}
        ></CollectionChildren>
      </div>
    )
  )
}

function CollectionChildren({
  pushToast,
  collection,
  title,
  language,
  editing,
  shareLink,
  onShare,
  onCharge,
}: {
  pushToast: ToastAPI['pushToast']
  collection: CollectionOutput
  title: string
  language: string
  editing: number
  shareLink: string | undefined
  onShare: () => void
  onCharge: () => void
}) {
  const intl = useIntl()
  const theme = useTheme()
  const dir = isRTL(language) ? 'rtl' : undefined

  const parent = Xid.fromValue(collection.id).toString()
  const gid = Xid.fromValue(collection.gid).toString()
  const { updateCollectionStatus } = useCollectionAPI()
  const { publishPublication } = usePublicationAPI()
  const { releaseCreation } = useCreationAPI()
  const readPublicationByJob = useReadPublicationByJob()

  const { getPayload: getBookmarkPayload } = useCollectionBookmarkList(parent)

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
  } = useCollectionChildrenViewer(pushToast, gid, parent, language)

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

  const scrollContainerRef = useContext(
    LargeDialogBodyRefContext
  ) as React.RefObject<HTMLDivElement>

  const shouldLoadMore = hasMore && !isValidating && loadMore
  const handleScroll = useCallback(() => {
    shouldLoadMore && shouldLoadMore()
  }, [shouldLoadMore])
  useScrollOnBottom({
    ref: scrollContainerRef,
    autoTriggerBottomCount: 3,
    onBottom: handleScroll,
  })

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

  const [currentChild, setCurrentChild] = useState<
    CollectionChildrenOutput | undefined
  >(undefined)

  const onClick = useCallback(
    (item: CollectionChildrenOutput) => {
      setCurrentChild(item)
    },
    [setCurrentChild]
  )

  const handleCollectionChildrenViewerClose = useCallback(() => {
    setCurrentChild(undefined)
  }, [setCurrentChild])

  const { show: showPublicationSettingDialog, ...publicationSetting } =
    usePublicationSettingDialog(pushToast)

  const { show: showCreationSettingDialog, ...creationSetting } =
    useCreationSettingDialog(pushToast)

  const onSetting = useCallback(
    (item: CollectionChildrenOutput) => {
      switch (item.kind) {
        case ObjectKind.Publication:
          showPublicationSettingDialog(
            item.gid,
            item.cid,
            item.language,
            item.version
          )
          return
        case ObjectKind.Creation:
          showCreationSettingDialog(item.gid, item.cid)
          return
      }
    },
    [showPublicationSettingDialog, showCreationSettingDialog]
  )

  const onPublish = useCallback(
    async (item: CollectionChildrenOutput) => {
      if (item.status == 2) {
        return
      }
      let res: {
        job: string
        result: PublicationOutput
      }
      switch (item.kind) {
        case ObjectKind.Collection:
          await updateCollectionStatus({
            gid: item.gid,
            id: item.cid,
            updated_at: item.updated_at,
            status: 2,
          })
          refresh()
          return
        case ObjectKind.Publication:
          await publishPublication({
            gid: item.gid,
            cid: item.cid,
            language: item.language,
            version: item.version,
            updated_at: item.updated_at,
            status: 2,
          })
          refresh()
          return
        case ObjectKind.Creation:
          res = await releaseCreation({
            gid: item.gid,
            cid: item.cid,
            language: item.language,
            version: item.version,
            model: '',
          })
          await readPublicationByJob(res.job)
          refresh()
          return
      }
    },
    [
      updateCollectionStatus,
      publishPublication,
      releaseCreation,
      readPublicationByJob,
      refresh,
    ]
  )

  const bookmarkPayload = useMemo(
    () => getBookmarkPayload(collection.id),
    [getBookmarkPayload, collection.id]
  )

  const currentRead =
    bookmarkPayload &&
    items.find((item) =>
      Xid.fromValue(item.cid).equals(Xid.fromValue(bookmarkPayload.cid))
    )

  useEffect(() => {
    if (bookmarkPayload && shouldLoadMore && !currentRead) {
      shouldLoadMore()
    }
  }, [bookmarkPayload, currentRead, shouldLoadMore])

  const ulRef = useRef<HTMLUListElement>(null)
  const [hasLongTitle, setHasLongTitle] = useState(false)
  useEffect(() => {
    if (ulRef.current) {
      const ulWidth = ulRef.current.clientWidth
      setHasLongTitle(
        some(
          ulRef.current.children,
          (li: HTMLElement) => li.offsetWidth * 2 > ulWidth
        )
      )
    }
  }, [setHasLongTitle, items])

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
      @media (max-width: ${BREAKPOINT.small}px) {
        justify-content: center;
      }
      li {
        padding: 0px;
        width: fit-content;
        min-width: ${hasLongTitle ? '100%' : '49%'};
        max-width: 100%;
        transition: height 0.4s ease-in-out, width 0.4s ease-in-out;
        @media (max-width: ${BREAKPOINT.small}px) {
          height: 48px;
        }
        ${editing > 0 &&
        css`
          min-width: 100%;
        `}
        ${editing > 1 &&
        css`
          height: 40px;
        `}
      }
      li > a {
        position: relative;
        ${textEllipsis}
        display: flex;
        flex-direction: column;
        padding: 12px 24px;
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
        ${editing > 1 &&
        css`
          padding: 0 24px 0 20px;
          line-height: 40px;
        `}
      }
    `,
    [editing, hasLongTitle, theme]
  )

  return (
    <>
      {bookmarkPayload && editing == 0 && (
        <Clickable
          onClick={currentRead && (() => onClick(currentRead))}
          css={css`
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            align-items: center;
            margin-top: 24px;
            color: ${currentRead
              ? theme.palette.green
              : theme.color.body.default};
            gap: 8px;
            max-width: calc(100% - 40px);
            flex: 1;
          `}
        >
          <Icon name='memory' size='medium' />
          <span
            css={css`
              ${textEllipsis}
            `}
          >
            {bookmarkPayload.title}
          </span>
        </Clickable>
      )}
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
            {editing > 1 ? (
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
                                title={title}
                                item={item}
                                editing={editing}
                                onClick={onClick}
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
            ) : (
              <>
                {editing > 0 && (
                  <>
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
                )}

                <ul ref={ulRef} dir={dir} css={containerCss}>
                  {items.map((item) => (
                    <ChildItem
                      key={Xid.fromValue(item.cid).toString()}
                      title={title}
                      item={item}
                      editing={editing}
                      onClick={onClick}
                      onSetting={onSetting}
                      onPublish={onPublish}
                    ></ChildItem>
                  ))}
                </ul>
              </>
            )}
            <LoadMore
              hasMore={hasMore}
              isLoadingMore={isValidating}
              onLoadMore={loadMore}
              css={css`
                width: 100%;
              `}
            />
          </>
        ) : (
          <Placeholder />
        )}
        {currentChild && (
          <LargeDialog
            open={true}
            onClose={handleCollectionChildrenViewerClose}
          >
            <CollectionChildrenViewer
              pushToast={pushToast}
              isLoading={isLoading}
              collection={collection}
              child={currentChild}
              childrenItems={items}
              hasMore={hasMore}
              isLoadingMore={isValidating}
              shareLink={shareLink}
              onShare={onShare}
              loadMore={loadMore}
              onCharge={onCharge}
              onClose={handleCollectionChildrenViewerClose}
            />
          </LargeDialog>
        )}
      </div>
      <PublicationSettingDialog {...publicationSetting} />
      <CreationSettingDialog {...creationSetting} />
    </>
  )
}

function ChildItem({
  title,
  item,
  editing,
  onClick,
  onSetting,
  onPublish,
  onRemove,
  provided,
  snapshot,
}: {
  title: string
  item: CollectionChildrenOutput
  editing: number
  onClick: (item: CollectionChildrenOutput) => void
  onSetting?: (item: CollectionChildrenOutput) => void
  onPublish?: (item: CollectionChildrenOutput) => Promise<void>
  onRemove?: (item: CollectionChildrenOutput) => void
  provided?: DraggableProvided
  snapshot?: DraggableStateSnapshot
}) {
  const intl = useIntl()
  const theme = useTheme()
  const cid = Xid.fromValue(item.cid).toString()
  const [isRemove, setIsRemove] = useState(false)
  const handleClick = useCallback(
    (ev: React.MouseEvent<HTMLAnchorElement>) => {
      ev.preventDefault()
      onClick(item)
      return true
    },
    [onClick, item]
  )

  const handleRemove = useCallback(() => {
    if (onRemove) {
      setIsRemove(true)
      setTimeout(() => onRemove(item), 200)
    }
  }, [item, onRemove, setIsRemove])

  const [isPublishing, setIsPublishing] = useState(false)
  const handlePublish = useCallback(async () => {
    if (item.status < 2 && onPublish) {
      setIsPublishing(true)
      await onPublish(item)
      setIsPublishing(false)
    }
  }, [item, onPublish, setIsPublishing])

  const handleSetting = useCallback(() => {
    if (onSetting) {
      onSetting(item)
    }
  }, [item, onSetting])

  return (
    <li
      key={cid}
      dir={isRTL(item.language) ? 'rtl' : undefined}
      ref={provided?.innerRef}
      {...provided?.draggableProps}
      {...provided?.dragHandleProps}
      css={css`
        ${isRemove &&
        css`
          transform: scale(0);
          height: 0px !important;
        `}
      `}
    >
      <Link
        unstable_viewTransition={true}
        key={cid}
        onClick={editing > 1 ? preventDefaultStopPropagation : handleClick}
        to={'#'}
        style={{
          backgroundColor: snapshot?.isDragging
            ? theme.palette.grayLight0
            : undefined,
        }}
      >
        {editing == 2 && (
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
        <div
          css={css`
            ${textEllipsis}
          `}
        >
          {editing == 1 ? item.title : genFullChildTitle(title, item)}
        </div>
        {editing == 1 && (
          <>
            {item.summary && (
              <div
                css={css`
                  margin-top: 12px;
                  ${textEllipsis}
                `}
              >
                {item.summary}
              </div>
            )}
            <div
              role='none'
              onClick={preventDefaultStopPropagation}
              css={css`
                width: fit-content;
                margin-top: 12px;
                display: flex;
                align-items: center;
                gap: 24px;
                @media (max-width: ${BREAKPOINT.small}px) {
                  display: none;
                }
              `}
            >
              <CollectionItemStatus status={item.status} />
              <Button
                size='small'
                color='secondary'
                variant='text'
                onClick={handleSetting}
              >
                <Icon name='settings' size='small' />
                <span>{intl.formatMessage({ defaultMessage: '设置' })}</span>
              </Button>
              {(item.status === CollectionStatus.Private ||
                item.status === CollectionStatus.Internal) && (
                <Button
                  size='small'
                  color='primary'
                  variant='outlined'
                  disabled={isPublishing}
                  onClick={handlePublish}
                >
                  {isPublishing && <Spinner size={12} />}
                  <span>
                    {intl.formatMessage({ defaultMessage: '公开发布' })}
                  </span>
                </Button>
              )}
            </div>
          </>
        )}
        {editing == 2 && (
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
