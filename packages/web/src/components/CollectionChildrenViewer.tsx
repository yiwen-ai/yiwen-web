import { GROUP_DETAIL_PATH } from '#/App'
import { BREAKPOINT } from '#/shared'
import { GroupViewType } from '#/store/useGroupDetailPage'
import { css, useTheme } from '@emotion/react'
import {
  Button,
  Icon,
  IconButton,
  Menu,
  MenuItem,
  QRCode,
  textEllipsis,
  type ToastAPI,
} from '@yiwen-ai/component'
import {
  ObjectKind,
  genFullChildTitle,
  getCollectionInfo,
  isRTL,
  toMessage,
  useCollectionBookmarkList,
  useCreation,
  usePublication,
  type CollectionChildrenOutput,
  type CollectionOutput,
  type CreationOutput,
  type PublicationOutput,
  type QueryPaymentCode,
} from '@yiwen-ai/store'
import { RGBA, useKeyDown, useScrollOnBottom } from '@yiwen-ai/util'
import { findLast, findLastIndex, map } from 'lodash-es'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
} from 'react'
import { useIntl } from 'react-intl'
import { useResizeDetector } from 'react-resize-detector'
import { Link, generatePath } from 'react-router-dom'
import { Xid } from 'xid-ts'
import { type RFP } from '../../../store/src/common'
import CommonViewer from './CommonViewer'
import { LoadMore } from './LoadMore'
import Loading from './Loading'
import PaymentConfirmDialog from './PaymentConfirmDialog'

export interface CollectionChildrenViewerProps
  extends HTMLAttributes<HTMLDivElement> {
  pushToast: ToastAPI['pushToast']
  isLoading: boolean
  collection: CollectionOutput | undefined
  child: CollectionChildrenOutput | undefined
  childrenItems: CollectionChildrenOutput[]
  hasMore: boolean
  isLoadingMore: boolean
  shareLink: string | undefined
  onShare: () => void
  loadMore: () => void
  onCharge: () => void
  onClose?: () => void
}

export default function CollectionChildrenViewer({
  pushToast,
  isLoading,
  collection,
  child,
  childrenItems,
  hasMore,
  isLoadingMore,
  shareLink,
  onShare,
  loadMore,
  onCharge,
  onClose,
  ...props
}: CollectionChildrenViewerProps) {
  const intl = useIntl()
  const theme = useTheme()
  const { width = 0, ref } = useResizeDetector<HTMLDivElement>()
  const isNarrow = width <= BREAKPOINT.small
  const [showMenu, setShowMenu] = useState(false)

  const [_, info] = useMemo(() => {
    return collection ? getCollectionInfo(collection) : []
  }, [collection])

  useEffect(() => {
    setShowMenu(!isNarrow && childrenItems.length > 0)
  }, [isNarrow, childrenItems.length])

  const [anchorChild, setAnchorChild] = useState<
    CollectionChildrenOutput | undefined
  >(child)

  const [activeCid, setActiveCid] = useState<string>(
    anchorChild ? Xid.fromValue(anchorChild.cid).toString() : ''
  )

  const headerChild = useMemo(
    () =>
      findLast(
        childrenItems,
        (item) => Xid.fromValue(item.cid).toString() === activeCid
      ) || anchorChild,
    [activeCid, anchorChild, childrenItems]
  )

  const handleMenuItemChange = useCallback(
    (item: CollectionChildrenOutput) => {
      setAnchorChild(item)
      setActiveCid(Xid.fromValue(item.cid).toString())
      if (isNarrow) {
        setShowMenu(false)
      }
    },
    [setAnchorChild, setActiveCid, setShowMenu, isNarrow]
  )

  const handleShowMenu = useCallback(() => {
    setShowMenu((v) => !v)
  }, [setShowMenu])

  const scrollContainerRef = useRef<HTMLUListElement>(null)
  const shouldLoadMore = showMenu && hasMore && !isLoadingMore && loadMore
  const handleScroll = useCallback(() => {
    shouldLoadMore && shouldLoadMore()
  }, [shouldLoadMore])
  useScrollOnBottom({
    ref: scrollContainerRef,
    autoTriggerBottomCount: 3,
    onBottom: handleScroll,
  })

  const [hideHeader, setHideHeader] = useState(false)
  const onMoveUp = useCallback(() => setHideHeader(true), [setHideHeader])
  const onMoveDown = useCallback(() => setHideHeader(false), [setHideHeader])

  return (
    <div
      {...props}
      ref={ref}
      css={css`
        display: block;
        position: relative;
        height: 100%;
      `}
    >
      {isLoading ? (
        <Loading />
      ) : headerChild ? (
        <>
          <div
            css={css`
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              z-index: 1;
              height: 40px;
              display: flex;
              align-items: flex-start;
              padding: 36px;
              gap: 24px;
              opacity: 1;
              transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
              ${hideHeader &&
              isNarrow &&
              css`
                opacity: 0;
                transform: translateY(-110%);
              `}
              @media (max-width: ${BREAKPOINT.small}px) {
                padding: 16px;
                gap: 16px;
                height: 28px;
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
              {childrenItems.length > 0 && (
                <Button
                  title={intl.formatMessage({ defaultMessage: '目录' })}
                  color={showMenu ? 'primary' : 'secondary'}
                  variant='outlined'
                  size={isNarrow ? 'small' : 'large'}
                  onClick={handleShowMenu}
                  css={css`
                    margin-right: 0 !important;
                  `}
                >
                  <Icon
                    name={showMenu ? 'menu-unfold-line' : 'menu-fold-line'}
                    size={isNarrow ? 'small' : 'medium'}
                  />
                  {isNarrow ? null : (
                    <span>
                      {intl.formatMessage({
                        defaultMessage: '目录',
                      })}
                    </span>
                  )}
                </Button>
              )}
              <div
                dir={isRTL(headerChild.language) ? 'rtl' : undefined}
                css={css`
                  ${textEllipsis}
                  ${!isNarrow && theme.typography.h2}
                  margin-right: auto;
                  max-width: 800px;
                  flex: 1;
                  @media (max-width: ${BREAKPOINT.small}px) {
                    max-width: 200px;
                  }
                `}
              >
                {headerChild.title}
              </div>
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
                  height: ${isNarrow ? '28px' : '40px'};
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
          <div
            css={css`
              position: relative;
              top: 112px;
              display: flex;
              flex-direction: column;
              padding: 0 36px;
              transition: top 0.3s ease-in-out;
              @media (max-width: ${BREAKPOINT.small}px) {
                top: 60px;
                flex-direction: column;
                align-items: center;
                padding: 0;
              }
              ${hideHeader &&
              isNarrow &&
              css`
                top: 0 !important;
              `}
              ${showMenu &&
              css`
                flex-direction: row-reverse;
              `}
            `}
          >
            {collection && anchorChild && (
              <ChildrenSection
                pushToast={pushToast}
                isNarrow={isNarrow}
                hideHeader={hideHeader}
                collection={collection}
                currentChild={anchorChild}
                childrenItems={childrenItems}
                activeCid={activeCid}
                setActiveCid={setActiveCid}
                onItemChange={handleMenuItemChange}
                onCharge={onCharge}
                onMoveUp={onMoveUp}
                onMoveDown={onMoveDown}
              />
            )}
            {showMenu && childrenItems.length > 0 && (
              <ul
                ref={scrollContainerRef}
                css={css`
                  display: flex;
                  flex-direction: column;
                  gap: 16px;
                  margin: 0;
                  padding: 0;
                  width: 300px;
                  list-style: none;
                  max-height: calc(100vh - 160px);
                  overflow-y: auto;
                  @media (max-width: ${BREAKPOINT.small}px) {
                    position: fixed;
                    bottom: 0;
                    width: 100%;
                    max-height: calc(100vh - 320px);
                    padding: 16px;
                    margin-bottom: 0;
                    box-shadow: ${theme.effect.card};
                    background-color: ${theme.color.body.background};
                    box-sizing: border-box;
                    border-radius: 12px 12px 0 0;
                  }
                `}
              >
                {childrenItems.map((item, i) => (
                  <li
                    key={Xid.fromValue(item.cid).toString()}
                    css={css`
                      padding: 0px;
                      height: 32px;
                      width: 100%;
                    `}
                  >
                    <Link
                      unstable_viewTransition={true}
                      key={Xid.fromValue(item.cid).toString()}
                      onClick={(ev: React.MouseEvent<HTMLAnchorElement>) => {
                        ev.preventDefault()
                        handleMenuItemChange(item)
                      }}
                      to={'#'}
                      dir={isRTL(item.language) ? 'rtl' : undefined}
                      css={css`
                        ${textEllipsis}
                        display: inline-block;
                        padding: 4px 12px;
                        height: 28px;
                        width: calc(100% - 12px * 2);
                        border-radius: 8px;
                        background-color: ${Xid.fromValue(
                          item.cid
                        ).toString() === activeCid
                          ? theme.color.button.secondary.contained.background
                          : ''};
                        :hover {
                          background-color: ${theme.color.button.secondary
                            .contained.background};
                        }
                      `}
                    >
                      {genFullChildTitle(info?.title || '', item)}
                    </Link>
                  </li>
                ))}
                <LoadMore
                  hasMore={hasMore}
                  isLoadingMore={isLoadingMore}
                  onLoadMore={loadMore}
                />
              </ul>
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}

function ChildrenSection({
  pushToast,
  isNarrow,
  collection,
  currentChild,
  childrenItems,
  activeCid,
  setActiveCid,
  onItemChange,
  onCharge,
  onMoveUp,
  onMoveDown,
}: React.HTMLAttributes<HTMLDivElement> & {
  pushToast: ToastAPI['pushToast']
  isNarrow: boolean
  hideHeader: boolean
  collection: CollectionOutput
  currentChild: CollectionChildrenOutput
  childrenItems: CollectionChildrenOutput[]
  activeCid: string
  setActiveCid: React.Dispatch<React.SetStateAction<string>>
  onItemChange: (item: CollectionChildrenOutput) => void
  onCharge: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
}) {
  const intl = useIntl()
  const theme = useTheme()

  const collectionGid = Xid.fromValue(collection.gid).toString()
  const collectionId = Xid.fromValue(collection.id).toString()

  const { tryUpdatePayload } = useCollectionBookmarkList(collectionId)

  const [prevChild, nextChild] = useMemo(() => {
    if (activeCid && childrenItems.length > 0) {
      for (const [index, item] of childrenItems.entries()) {
        if (Xid.fromValue(item.cid).toString() === activeCid) {
          return [
            index > 0 ? childrenItems[index - 1] : null,
            index < childrenItems.length - 1 ? childrenItems[index + 1] : null,
          ]
        }
      }
    }

    return [null, null]
  }, [childrenItems, activeCid])

  // ArrowUp ArrowRight ArrowDown ArrowLeft
  const onKeyDown = useCallback(
    (key: string) => {
      switch (key) {
        case 'ArrowUp':
        case 'ArrowLeft':
          if (prevChild) {
            onItemChange(prevChild)
          }
          break
        case 'ArrowDown':
        case 'ArrowRight':
          if (nextChild) {
            onItemChange(nextChild)
          }
          break
      }
    },
    [onItemChange, prevChild, nextChild]
  )

  useKeyDown(Boolean(prevChild || nextChild), onKeyDown)

  const {
    item,
    args,
    error: currentErr,
    refresh: refreshPublication,
  } = useChild(currentChild, collection.subtoken)
  const [renderList, setRenderList] = useState<RenderItem[]>([])

  useEffect(() => {
    item && setRenderList([{ item, args }])
  }, [item, args, setRenderList])

  // preload next publication for better UX
  const {
    item: nextItem,
    args: nextArgs,
    error: nextErr,
    isLoading: isNextLoading,
  } = useChild(nextChild, collection.subtoken)

  useEffect(() => {
    const err = currentErr || nextErr
    if (err) {
      pushToast({
        type: 'warning',
        message: intl.formatMessage({ defaultMessage: '读取原文失败' }),
        description: toMessage(err),
      })
    }
  }, [intl, pushToast, currentErr, nextErr])

  const childrenViewerRef = useRef<HTMLDivElement>(null)
  const handleScroll = useCallback(() => {
    if (childrenViewerRef.current) {
      const cid = findLast(
        map(
          childrenViewerRef.current.children,
          (child) => child.attributes.getNamedItem('data-id')?.value || ''
        ),
        (id) => id !== ''
      )

      if (cid) {
        const i = findLastIndex(
          childrenItems,
          (item) => Xid.fromValue(item.cid).toString() === cid
        )
        const next =
          i >= 0 && i < childrenItems.length - 1 ? childrenItems[i + 1] : null
        if (
          next &&
          nextItem &&
          nextArgs &&
          Xid.fromValue(next.cid).toString() == nextArgs.cid
        ) {
          setRenderList((prev) => {
            for (const { item } of prev) {
              if (Object.is(item, nextItem)) {
                return prev
              }
            }

            return [...prev, { item: nextItem, args: nextArgs }]
          })
          setActiveCid(nextArgs.cid)
        } else {
          setActiveCid(cid)
        }
      }
    }
  }, [childrenItems, nextItem, nextArgs, setRenderList, setActiveCid])

  useScrollOnBottom({
    ref: childrenViewerRef,
    autoTriggerBottomCount: 3,
    onBottom: handleScroll,
    onMoveUp,
    onMoveDown,
  })

  useEffect(() => {
    const item = findLast(
      childrenItems,
      (item) => Xid.fromValue(item.cid).toString() === activeCid
    )

    if (item) {
      tryUpdatePayload(item.parent, {
        gid: item.gid,
        cid: item.cid,
        offset: 1,
        title: item.title,
      })
    }
  }, [tryUpdatePayload, activeCid, childrenItems])

  const commonViewerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    commonViewerRef.current?.scrollIntoView(true)
  }, [item])

  const [currentPaymentArgs, setCurrentPaymentArgs] =
    useState<PaymentArgs | null>(null)

  const [payFor, setPayFor] = useState<Record<
    keyof QueryPaymentCode,
    string
  > | null>(null)
  const [paymentDisabled, setPaymentDisabled] = useState(false)

  const handlePaymentClose = useCallback(() => {
    setPayFor(null)
  }, [setPayFor])

  const [hidePayment, setHidePayment] = useState(false)
  const handleHidePayment = useCallback(() => {
    setHidePayment((v) => !v)
  }, [setHidePayment])

  useEffect(() => {
    item?.rfp &&
      setCurrentPaymentArgs({
        referredGid: Xid.fromValue(item.gid).toString(),
        rfp: item.rfp,
      })
  }, [item, setCurrentPaymentArgs])

  const handleCheckSubscription = useCallback(() => {
    refreshPublication && refreshPublication()
  }, [refreshPublication])

  return (
    <div
      ref={childrenViewerRef}
      css={css`
        display: flex;
        flex-direction: column;
        width: 100%;
        max-height: calc(100vh - 160px);
        overflow-y: auto;
        @media (max-width: ${BREAKPOINT.small}px) {
          max-height: 100vh;
        }
      `}
    >
      {currentPaymentArgs && (
        <div
          css={css`
            position: fixed;
            z-index: 1;
            height: fit-content;
            width: 100%;
            bottom: 0;
            left: 0;
            background-color: ${RGBA(theme.palette.white, 0.94)};
            box-shadow: ${theme.effect.card};
            transform: ${hidePayment ? 'translateY(100%)' : 'none'};
            transition: height 0.3s ease-in-out, transform 0.3s ease-in-out;
            :hover {
              box-shadow: ${theme.effect.cardHover};
            }
          `}
        >
          <Button
            color='secondary'
            variant='text'
            onClick={handleHidePayment}
            css={css`
              display: block;
              width: 100%;
            `}
          >
            <Icon
              name='arrow-down-s-line'
              size='medium'
              css={css`
                display: block;
                margin: 0 auto;
              `}
            />
          </Button>
          <PaymentSection
            referredGid={currentPaymentArgs.referredGid}
            rfp={currentPaymentArgs.rfp}
            setPayFor={setPayFor}
          />
          <PaymentConfirmDialog
            pushToast={pushToast}
            onClose={handlePaymentClose}
            disabled={paymentDisabled}
            setDisabled={setPaymentDisabled}
            payFor={payFor}
            onCharge={onCharge}
            checkSubscription={handleCheckSubscription}
          />
        </div>
      )}
      {collectionGid &&
        renderList &&
        renderList.map((item) => (
          <CommonViewer
            data-id={item.args?.cid}
            ref={item.args?.cid === activeCid ? commonViewerRef : undefined}
            type={item.args?.viewType || GroupViewType.Publication}
            key={item.args?.cid || ''}
            item={item.item}
            isNarrow={isNarrow}
            gid={collectionGid}
            footer={
              hidePayment && item.item.rfp ? (
                <PaymentSection
                  referredGid={Xid.fromValue(item.item.gid).toString()}
                  rfp={item.item.rfp}
                  setPayFor={setPayFor}
                />
              ) : null
            }
            css={css`
              margin: 8px auto;
              padding: 16px 36px;
              border-radius: 8px;
              box-shadow: ${theme.effect.card};
            `}
          />
        ))}
      {isNextLoading ? (
        <Loading />
      ) : (
        (prevChild || nextChild) && (
          <div
            css={css`
              display: flex;
              flex-direction: row;
              justify-content: center;
              width: 100%;
              gap: 24px;
              margin-bottom: 48px;
            `}
          >
            {prevChild && (
              <Link
                reloadDocument={prevChild.kind === ObjectKind.Collection}
                unstable_viewTransition={true}
                onClick={(ev: React.MouseEvent<HTMLAnchorElement>) => {
                  ev.preventDefault()
                  onItemChange(prevChild)
                }}
                to={'#'}
                css={css`
                  display: block;
                `}
              >
                <Button
                  title={intl.formatMessage({
                    defaultMessage: '上一篇',
                  })}
                  color='secondary'
                  variant='outlined'
                  size={isNarrow ? 'small' : 'large'}
                >
                  <Icon
                    name='arrow-up-s-line'
                    size={isNarrow ? 'small' : 'medium'}
                  />
                  {!isNarrow && (
                    <span>
                      {intl.formatMessage({ defaultMessage: '上一篇' })}
                    </span>
                  )}
                </Button>
              </Link>
            )}
            {collectionGid && collectionId && isNarrow && (
              <Link
                reloadDocument={false}
                unstable_viewTransition={true}
                to={{
                  pathname: generatePath(GROUP_DETAIL_PATH, {
                    gid: collectionGid,
                    type: GroupViewType.Collection,
                  }),
                  search: new URLSearchParams({
                    cid: collectionId,
                  }).toString(),
                }}
                css={css`
                  display: block;
                `}
              >
                <Button
                  title={intl.formatMessage({ defaultMessage: '目录' })}
                  color='secondary'
                  variant='outlined'
                  size={'small'}
                >
                  <Icon name='menu-line' size={'small'} />
                  {!isNarrow && (
                    <span>
                      {intl.formatMessage({ defaultMessage: '目录' })}
                    </span>
                  )}
                </Button>
              </Link>
            )}
            {nextChild && (
              <Link
                reloadDocument={nextChild.kind === ObjectKind.Collection}
                unstable_viewTransition={true}
                onClick={(ev: React.MouseEvent<HTMLAnchorElement>) => {
                  ev.preventDefault()
                  onItemChange(nextChild)
                }}
                to={'#'}
                css={css`
                  display: block;
                `}
              >
                <Button
                  title={intl.formatMessage({
                    defaultMessage: '下一篇',
                  })}
                  color='secondary'
                  variant='outlined'
                  size={isNarrow ? 'small' : 'large'}
                >
                  <Icon
                    name='arrow-down-s-line'
                    size={isNarrow ? 'small' : 'medium'}
                  />
                  {!isNarrow && (
                    <span>
                      {intl.formatMessage({ defaultMessage: '下一篇' })}
                    </span>
                  )}
                </Button>
              </Link>
            )}
          </div>
        )
      )}
    </div>
  )
}

function PaymentSection({
  referredGid,
  rfp,
  setPayFor,
}: React.HTMLAttributes<HTMLDivElement> &
  PaymentArgs & {
    setPayFor: React.Dispatch<
      React.SetStateAction<Record<keyof QueryPaymentCode, string> | null>
    >
  }) {
  const intl = useIntl()
  const theme = useTheme()
  return (
    <div
      css={css`
        width: 100%;
        max-width: 800px;
        margin: 0 auto;
        padding-bottom: 48px;
      `}
    >
      <p
        css={css`
          width: 100%;
          color: ${theme.color.body.primary};
          text-align: center;
          ${theme.typography.bodyBold}
        `}
      >
        {intl.formatMessage({
          defaultMessage: '付费后即可阅读剩余 38% 的内容',
        })}
      </p>
      <div
        css={css`
          display: flex;
          flex-direction: row;
          margin-top: 16px;
          gap: 16px;
          width: 100%;
          text-align: center;
          justify-content: center;
          flex-wrap: wrap;
          align-items: center;
        `}
      >
        {rfp.collection && (
          <Button
            color='primary'
            variant='contained'
            onClick={() =>
              rfp.collection &&
              setPayFor({
                gid: referredGid,
                cid: Xid.fromValue(rfp.collection.id).toString(),
                kind: '2', // pay for collection
              })
            }
            css={css`
              width: fit-content;
            `}
          >
            <span>
              {intl.formatMessage({ defaultMessage: '为合集付费' }) +
                ' - ' +
                intl.formatMessage(
                  { defaultMessage: '{amount} 文' },
                  { amount: rfp.collection.price }
                )}
            </span>
          </Button>
        )}
        {rfp.creation && (
          <Button
            color='secondary'
            variant='outlined'
            onClick={() =>
              rfp.creation &&
              setPayFor({
                gid: referredGid,
                cid: Xid.fromValue(rfp.creation.id).toString(),
                kind: '0', // pay for creation
              })
            }
            css={css`
              width: fit-content;
            `}
          >
            <span>
              {intl.formatMessage({ defaultMessage: '为文章付费' }) +
                ' - ' +
                intl.formatMessage(
                  { defaultMessage: '{amount} 文' },
                  { amount: rfp.creation.price }
                )}
            </span>
          </Button>
        )}
      </div>
    </div>
  )
}

interface PaymentArgs {
  referredGid: string // // 触发支付的 group，如果不是订阅对象所属 group，则收益分成给该 group 的 owner
  rfp: RFP
}

interface ChildArgs {
  gid?: string
  cid?: string
  parent?: string
  language?: string
  version?: number
  kind?: ObjectKind
  viewType: GroupViewType
}

type ChildItem = (PublicationOutput | CreationOutput) & {
  id?: Uint8Array
  cid?: Uint8Array
  rfp?: RFP
  args?: ChildArgs
}

type RenderItem = { item: ChildItem; args: ChildArgs }

function useChild(
  child: CollectionChildrenOutput | null | undefined,
  subtoken?: string
): {
  isLoading: boolean
  error: unknown
  item: ChildItem | undefined
  args: ChildArgs
  refresh?: () => void
} {
  const args = useMemo(() => {
    if (!child) return { viewType: GroupViewType.Collection }
    return {
      gid: Xid.fromValue(child.gid).toString(),
      cid: Xid.fromValue(child.cid).toString(),
      parent: Xid.fromValue(child.parent).toString(),
      language: child.language,
      version: child.version,
      kind: child.kind,
      viewType:
        child.kind === ObjectKind.Publication
          ? GroupViewType.Publication
          : child.kind === ObjectKind.Creation
          ? GroupViewType.Creation
          : GroupViewType.Collection,
    }
  }, [child])

  const {
    isLoading: isPublicationLoading,
    error: publicationError,
    refresh,
    publication,
  } = usePublication(
    args.gid,
    args.kind === ObjectKind.Publication ? args.cid : undefined,
    args.language,
    args.version,
    args.parent,
    subtoken
  )

  const {
    isLoading: isCreationLoading,
    error: creationError,
    creation,
  } = useCreation(
    args.gid,
    args.kind === ObjectKind.Creation ? args.cid : undefined
  )

  switch (args.kind) {
    case ObjectKind.Publication:
      return {
        isLoading: isPublicationLoading,
        error: publicationError,
        item: publication,
        refresh,
        args,
      }

    case ObjectKind.Creation:
      return {
        isLoading: isCreationLoading,
        error: creationError,
        item: creation,
        args,
      }
    default:
      return { isLoading: false, error: undefined, item: undefined, args }
  }
}
