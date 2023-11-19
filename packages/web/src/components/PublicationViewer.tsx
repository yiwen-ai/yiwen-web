import { GROUP_DETAIL_PATH, ThemeContext } from '#/App'
import { AutoLoadMore } from '#/components/LoadMore'
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
  isRTL,
  useAuth,
  type CollectionChildrenOutput,
  type GPT_MODEL,
  type PublicationOutput,
  type QueryPaymentCode,
  type UILanguageItem,
} from '@yiwen-ai/store'
import { RGBA } from '@yiwen-ai/util'
import { escapeRegExp } from 'lodash-es'
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type HTMLAttributes,
} from 'react'
import { useIntl } from 'react-intl'
import { useResizeDetector } from 'react-resize-detector'
import { Link, generatePath } from 'react-router-dom'
import { Xid } from 'xid-ts'
import ChargeDialog, { type ChargeDialogProps } from './ChargeDialog'
import CommonViewer from './CommonViewer'
import ErrorPlaceholder from './ErrorPlaceholder'
import Loading from './Loading'
import PaymentConfirmDialog from './PaymentConfirmDialog'
import TranslateConfirmDialog, {
  type TranslateConfirmDialogProps,
} from './TranslateConfirmDialog'
import TranslateDialog, { type TranslateDialogProps } from './TranslateDialog'

export interface PublicationViewerProps extends HTMLAttributes<HTMLDivElement> {
  pushToast: ToastAPI['pushToast']
  responsive: boolean
  isLoading: boolean
  error: unknown
  publication: PublicationOutput | undefined
  currentLanguage: UILanguageItem | undefined
  originalLanguage: UILanguageItem | undefined
  translatedLanguageList: UILanguageItem[] | undefined
  pendingLanguageList: UILanguageItem[] | undefined
  collectionMenu: CollectionChildrenOutput[]
  hasMore: boolean
  isLoadingMore: boolean
  refreshPublication: () => void
  loadMore: () => void
  onCharge: () => void
  onTranslate: (language: UILanguageItem, model: GPT_MODEL) => void
  onSwitch: (language: UILanguageItem, canTranslate: boolean) => void
  shareLink: string | undefined
  onShare: () => void
  isFavorite: boolean
  isAddingFavorite: boolean
  isRemovingFavorite: boolean
  onAddFavorite: () => void
  onRemoveFavorite: () => void
  onClose?: () => void
  translateConfirmDialog: Omit<
    TranslateConfirmDialogProps,
    'onCharge' | 'onTranslate'
  >
  translateDialog: TranslateDialogProps
  chargeDialog: ChargeDialogProps
}

export default function PublicationViewer({
  pushToast,
  responsive,
  isLoading,
  error,
  publication,
  currentLanguage,
  originalLanguage,
  translatedLanguageList: _translatedLanguageList,
  pendingLanguageList: _pendingLanguageList,
  collectionMenu,
  hasMore,
  isLoadingMore,
  refreshPublication,
  loadMore,
  onCharge,
  onTranslate,
  onSwitch,
  shareLink,
  onShare,
  isFavorite,
  isAddingFavorite,
  isRemovingFavorite,
  onAddFavorite,
  onRemoveFavorite,
  onClose,
  translateConfirmDialog,
  translateDialog,
  chargeDialog,
  ...props
}: PublicationViewerProps) {
  const intl = useIntl()
  const theme = useTheme()
  const { user } = useAuth()
  const { width = 0, ref } = useResizeDetector<HTMLDivElement>()
  const setTheme = useContext(ThemeContext)
  const isNarrow = responsive && width <= BREAKPOINT.small
  const [showMenu, setShowMenu] = useState(false)

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

  const [prevCid, setPrevCid] = useState<string>('')
  const { _cid, _gid, dir } = useMemo(() => {
    if (!publication) return {}
    return {
      _gid: Xid.fromValue(publication.gid).toString(),
      _cid: Xid.fromValue(publication.cid).toString(),
      dir: isRTL(publication.language) ? 'rtl' : undefined,
    }
  }, [publication])

  useEffect(() => {
    if (isNarrow) {
      if (_cid && prevCid != _cid) {
        setPrevCid(_cid)
        setShowMenu(false)
      }
    } else {
      setShowMenu(collectionMenu.length > 0)
    }
  }, [isNarrow, _cid, prevCid, setPrevCid, setShowMenu, collectionMenu.length])

  const translatedLanguageList = useMemo(() => {
    return _translatedLanguageList?.filter((item) => {
      return (
        keywordRE.test(item.code) ||
        keywordRE.test(item.name) ||
        keywordRE.test(item.nativeName)
      )
    })
  }, [_translatedLanguageList, keywordRE])

  const pendingLanguageList = useMemo(() => {
    return _pendingLanguageList?.filter((item) => {
      return (
        keywordRE.test(item.code) ||
        keywordRE.test(item.name) ||
        keywordRE.test(item.nativeName)
      )
    })
  }, [_pendingLanguageList, keywordRE])

  const isProcessing = useMemo(() => {
    return Boolean(
      _translatedLanguageList?.some((item) => item.isProcessing) ||
        _pendingLanguageList?.some((item) => item.isProcessing)
    )
  }, [_pendingLanguageList, _translatedLanguageList])

  const upateCurrent = useMemo(() => {
    return Boolean(
      originalLanguage &&
        currentLanguage &&
        !isProcessing &&
        originalLanguage.version > currentLanguage.version &&
        user
    )
  }, [originalLanguage, currentLanguage, isProcessing, user])

  const [parent, prevItem, nextItem] = useMemo(() => {
    if (_cid && collectionMenu.length > 0) {
      const parent = collectionMenu[0]?.parent || null
      for (const [index, item] of collectionMenu.entries()) {
        if (Xid.fromValue(item.cid).toString() === _cid) {
          return [
            parent && Xid.fromValue(parent).toString(),
            index > 0 ? collectionMenu[index - 1] : null,
            index < collectionMenu.length - 1
              ? collectionMenu[index + 1]
              : null,
          ]
        }
      }
    }

    return [null, null, null]
  }, [collectionMenu, _cid])

  const handleShowMenu = useCallback(() => {
    setShowMenu((v) => !v)
  }, [setShowMenu])

  const [payFor, setPayFor] = useState<Record<
    keyof QueryPaymentCode,
    string
  > | null>(null)
  const [paymentDisabled, setPaymentDisabled] = useState(false)

  const handlePaymentClose = useCallback(() => {
    setPayFor(null)
  }, [setPayFor])

  const handlePayForPublication = useCallback(() => {
    if (!publication || !publication?.rfp?.creation) return
    setPayFor({
      gid: Xid.fromValue(publication.gid).toString(),
      cid: Xid.fromValue(publication.cid).toString(),
      kind: '0', // pay for creation
    })
  }, [publication, setPayFor])

  const handlePayForCollection = useCallback(() => {
    if (!publication || !publication?.rfp?.collection) return
    setPayFor({
      gid: Xid.fromValue(publication.gid).toString(),
      cid: Xid.fromValue(publication?.rfp?.collection.id).toString(),
      kind: '2', // pay for collection
    })
  }, [publication, setPayFor])

  const handleCheckSubscription = useCallback(() => {
    refreshPublication()
  }, [refreshPublication])

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
      ) : publication ? (
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
              {collectionMenu.length > 0 && (
                <Button
                  title={intl.formatMessage({ defaultMessage: '目录' })}
                  color={showMenu ? 'primary' : 'secondary'}
                  variant='outlined'
                  size={isNarrow ? 'small' : 'large'}
                  onClick={handleShowMenu}
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
              <Button
                title={intl.formatMessage({ defaultMessage: '创作语言' })}
                color='primary'
                variant='outlined'
                size={isNarrow ? 'small' : 'large'}
                disabled={!originalLanguage || originalLanguage.isCurrent}
                onClick={
                  originalLanguage
                    ? () => onSwitch(originalLanguage, false)
                    : undefined
                }
              >
                {!originalLanguage && <Spinner size='small' />}
                {originalLanguage?.nativeName ?? publication.from_language}
              </Button>
              {!currentLanguage || currentLanguage.isOriginal ? null : (
                <Button
                  title={
                    upateCurrent
                      ? intl.formatMessage({ defaultMessage: '更新版本' })
                      : intl.formatMessage({
                          defaultMessage: '当前语言',
                        })
                  }
                  color='primary'
                  variant='outlined'
                  size={isNarrow ? 'small' : 'large'}
                  disabled={!upateCurrent}
                  onClick={
                    upateCurrent
                      ? () => onSwitch(currentLanguage, true)
                      : undefined
                  }
                >
                  {currentLanguage.nativeName}
                  {!upateCurrent ? null : <Icon name='refresh' size='small' />}
                </Button>
              )}
              {translatedLanguageList && pendingLanguageList && (
                <Select
                  anchor={(props) => (
                    <Button
                      color='secondary'
                      size={isNarrow ? 'small' : 'large'}
                      {...props}
                    >
                      {isProcessing ? (
                        <Spinner size={isNarrow ? 'small' : 'medium'} />
                      ) : (
                        <Icon
                          name='translate3'
                          size={isNarrow ? 'small' : 'medium'}
                        />
                      )}
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
                    width: 360px;
                  `}
                >
                  <li
                    role='none'
                    css={css`
                      list-style: none;
                      padding: 4px 8px;
                    `}
                  >
                    {intl.formatMessage({
                      defaultMessage:
                        '对于未翻译语言，可创建翻译版本到自己的创作中心',
                    })}
                  </li>
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
                      onSelect={() => onSwitch(originalLanguage, false)}
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
                          onSelect={() => onSwitch(item, false)}
                        />
                      ))}
                    </SelectOptionGroup>
                  )}
                  {originalLanguage && pendingLanguageList.length > 0 && (
                    <SelectOptionGroup
                      label={intl.formatMessage({ defaultMessage: '未翻译' })}
                    >
                      {pendingLanguageList.map((item) => (
                        <SelectOption
                          key={item.code}
                          after={item.isProcessing && <Spinner size='small' />}
                          label={`${item.nativeName} (${item.name})`}
                          value={item.code}
                          dir={item.dir}
                          disabled={item.isProcessing}
                          onSelect={() => onSwitch(item, true)}
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
                {isNarrow ? null : (
                  <Button
                    color='secondary'
                    css={css`
                      display: none;
                    `}
                  >
                    <Icon name='compare' size='small' />
                    {intl.formatMessage({ defaultMessage: '对比原文' })}
                  </Button>
                )}
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
          <div
            css={css`
              display: flex;
              flex-direction: row-reverse;
              padding: 0 36px;
              @media (max-width: ${BREAKPOINT.small}px) {
                flex-direction: column;
                align-items: center;
                padding: 16px 0 0 0;
              }
            `}
          >
            <CommonViewer
              type={GroupViewType.Publication}
              item={publication}
              isNarrow={isNarrow}
              gid={_gid}
              parent={parent}
              prevItem={prevItem}
              nextItem={nextItem}
            />
            {showMenu && collectionMenu.length > 0 && (
              <ul
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
                    max-height: calc(100vh - 160px);
                    padding: 16px;
                    margin-bottom: 0;
                    box-shadow: ${theme.effect.card};
                    background-color: ${theme.color.body.background};
                    box-sizing: border-box;
                    border-radius: 12px 12px 0 0;
                  }
                `}
              >
                {collectionMenu.map((item) => (
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
                      to={{
                        pathname: generatePath(GROUP_DETAIL_PATH, {
                          gid: _gid as string,
                          type:
                            item.kind === ObjectKind.Collection
                              ? GroupViewType.Collection
                              : GroupViewType.Publication,
                        }),
                        search:
                          item.kind === ObjectKind.Collection
                            ? new URLSearchParams({
                                cid: Xid.fromValue(item.cid).toString(),
                              }).toString()
                            : new URLSearchParams({
                                parent: Xid.fromValue(item.parent).toString(),
                                cid: Xid.fromValue(item.cid).toString(),
                                language: item.language,
                                version: String(item.version),
                              }).toString(),
                      }}
                      dir={dir}
                      css={css`
                        ${textEllipsis}
                        display: inline-block;
                        padding: 4px 12px;
                        height: 28px;
                        width: calc(100% - 12px * 2);
                        border-radius: 8px;
                        background-color: ${Xid.fromValue(
                          item.cid
                        ).toString() === _cid
                          ? theme.color.button.secondary.contained.background
                          : ''};
                        :hover {
                          background-color: ${theme.color.button.secondary
                            .contained.background};
                        }
                      `}
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
                <AutoLoadMore
                  hasMore={hasMore}
                  isLoadingMore={isLoading}
                  onLoadMore={loadMore}
                />
              </ul>
            )}
          </div>
        </>
      ) : null}
      <TranslateConfirmDialog
        onCharge={onCharge}
        onTranslate={onTranslate}
        {...translateConfirmDialog}
      />
      <TranslateDialog {...translateDialog} />
      <ChargeDialog {...chargeDialog} />
      {publication?.rfp && (
        <div
          css={css`
            position: fixed;
            height: 140px;
            width: 100%;
            bottom: 0;
            left: 0;
            background-color: ${RGBA(theme.palette.white, 0.94)};
            box-shadow: ${theme.effect.card};
            :hover {
              box-shadow: ${theme.effect.cardHover};
            }
          `}
        >
          <div
            css={css`
              width: 100%;
              max-width: 800px;
              margin: 0 auto;
              padding: 24px 36px;
              @media (max-width: ${BREAKPOINT.small}px) {
                padding: 12px 24px;
              }
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
                align-items: center;
              `}
            >
              {publication.rfp.collection && (
                <Button
                  color='primary'
                  variant='contained'
                  onClick={handlePayForCollection}
                  css={css`
                    width: fit-content;
                  `}
                >
                  <span>
                    {intl.formatMessage({ defaultMessage: '为合集付费' })}
                  </span>
                  <span>
                    {intl.formatMessage(
                      { defaultMessage: '{amount} 文' },
                      { amount: publication.rfp.collection.price }
                    )}
                  </span>
                </Button>
              )}
              {publication.rfp.creation && (
                <Button
                  color='secondary'
                  variant='outlined'
                  onClick={handlePayForPublication}
                  css={css`
                    width: fit-content;
                  `}
                >
                  <span>
                    {intl.formatMessage({ defaultMessage: '为作品付费' })}
                  </span>
                  <span>
                    {intl.formatMessage(
                      { defaultMessage: '{amount} 文' },
                      { amount: publication.rfp.creation.price }
                    )}
                  </span>
                </Button>
              )}
            </div>
          </div>
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
    </div>
  )
}
