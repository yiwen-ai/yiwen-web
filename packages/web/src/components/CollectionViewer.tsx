import { GROUP_DETAIL_PATH, ThemeContext } from '#/App'
import CreatedBy from '#/components/CreatedBy'
import { LoadMore } from '#/components/LoadMore'
import Placeholder from '#/components/Placeholder'
import { BREAKPOINT, MAX_WIDTH } from '#/shared'
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
} from '@yiwen-ai/component'
import {
  ObjectKind,
  getCollectionInfo,
  isRTL,
  type CollectionChildrenOutput,
  type CollectionOutput,
  type UILanguageItem,
} from '@yiwen-ai/store'
import { escapeRegExp } from 'lodash-es'
import {
  useCallback,
  useContext,
  useMemo,
  useState,
  type HTMLAttributes,
} from 'react'
import { useIntl } from 'react-intl'
import { useResizeDetector } from 'react-resize-detector'
import { Link, generatePath } from 'react-router-dom'
import { Xid } from 'xid-ts'
import ChargeDialog, { type ChargeDialogProps } from './ChargeDialog'
import ErrorPlaceholder from './ErrorPlaceholder'
import Loading from './Loading'

export interface CollectionViewerProps extends HTMLAttributes<HTMLDivElement> {
  responsive: boolean
  isLoading: boolean
  isChildrenLoading: boolean
  error: unknown
  collection: CollectionOutput | undefined
  childrenItems: CollectionChildrenOutput[] | undefined
  currentLanguage: UILanguageItem | undefined
  originalLanguage: UILanguageItem | undefined
  translatedLanguageList: UILanguageItem[] | undefined
  pendingLanguageList: UILanguageItem[] | undefined
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
  hasMore: boolean
  isLoadingMore: boolean
  loadMore: () => void
}

export default function CollectionViewer({
  responsive,
  isLoading,
  isChildrenLoading,
  error,
  collection,
  childrenItems,
  hasMore,
  isLoadingMore,
  loadMore,
  currentLanguage,
  originalLanguage,
  translatedLanguageList: _translatedLanguageList,
  pendingLanguageList: _pendingLanguageList,
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
              collection={collection}
              childrenItems={childrenItems}
              isChildrenLoading={isChildrenLoading}
              hasMore={hasMore}
              isLoadingMore={isLoadingMore}
              loadMore={loadMore}
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
  collection,
  childrenItems,
  isChildrenLoading,
  hasMore,
  isLoadingMore,
  loadMore,
  isNarrow,
}: {
  collection: CollectionOutput
  childrenItems: CollectionChildrenOutput[] | undefined
  isChildrenLoading: boolean
  hasMore: boolean
  isLoadingMore: boolean
  loadMore: () => void
  isNarrow: boolean
}) {
  const intl = useIntl()
  const theme = useTheme()
  const [language, info] = useMemo(() => {
    return getCollectionInfo(collection)
  }, [collection])

  const { _cid, _gid } = useMemo(() => {
    if (!collection) return {}
    return {
      _gid: Xid.fromValue(collection.gid).toString(),
      _cid: Xid.fromValue(collection.id).toString(),
    }
  }, [collection])

  const dir = useMemo(() => {
    return isRTL(language) ? 'rtl' : undefined
  }, [language])

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
              'https://cdn.yiwen.pub/yiwen.ai.png'
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
              margin-left: 24px;
              width: calc(${MAX_WIDTH} + 36px * 2 - 160px - 24px);
            `}
          >
            <div
              dir={dir}
              css={css`
                ${theme.typography.h0}
              `}
            >
              {info.title}
            </div>
            {info.summary && (
              <div
                dir={dir}
                css={css`
                  margin-top: 12px;
                `}
              >
                {info.summary}
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
                  margin-top: 12px;
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
              <Button
                color={collection.rfp ? 'primary' : 'secondary'}
                variant='contained'
                disabled={!collection.rfp}
                onClick={() => {}}
                css={css`
                  margin-top: 12px;
                  :disabled {
                    border-color: ${theme.color.alert.success.border};
                    background-color: ${theme.color.alert.success.border};
                    color: white;
                  }
                `}
              >
                {collection.rfp && collection.rfp.collection > 0 && (
                  <>
                    <span>
                      {intl.formatMessage({ defaultMessage: '付费阅读' })}
                    </span>
                    <Icon name='coin' size='small' />
                    <span
                      css={css`
                        margin-left: -8px;
                      `}
                    >
                      {collection.rfp.collection}
                    </span>
                  </>
                )}
                {collection.subscription &&
                  collection.subscription.expire_at > 0 && (
                    <>
                      <span>
                        {intl.formatMessage({
                          defaultMessage: '已付费，有效期至',
                        })}
                      </span>
                      <span>
                        {new Date(
                          collection.subscription.expire_at * 1000
                        ).toLocaleDateString()}
                      </span>
                    </>
                  )}
              </Button>
            )}
          </div>
        </div>
        <div
          css={css`
            margin: 36px auto;
            @media (max-width: ${BREAKPOINT.small}px) {
              margin: 24px auto;
            }
          `}
        >
          {isChildrenLoading ? (
            <Loading />
          ) : childrenItems && childrenItems.length > 0 ? (
            <ul
              css={css`
                display: flex;
                flex-direction: row;
                flex-wrap: wrap;
                justify-content: space-between;
                gap: 16px;
                margin: 0;
                padding: 0;
                width: 100%;
                list-style: none;
              `}
            >
              {childrenItems.map((item) => (
                <li
                  key={Xid.fromValue(item.cid).toString()}
                  css={css`
                    padding: 0px;
                    height: 60px;
                    width: 100%;
                    @media (max-width: ${BREAKPOINT.small}px) {
                      height: 48px;
                    }
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
                              parent: _cid as string,
                              cid: Xid.fromValue(item.cid).toString(),
                              language: item.language,
                              version: String(item.version),
                            }).toString(),
                    }}
                    dir={dir}
                    css={css`
                      ${textEllipsis}
                      display: inline-block;
                      padding: 16px 24px;
                      height: 28px;
                      width: calc(100% - 24px * 2);
                      border-radius: 12px;
                      box-shadow: ${theme.effect.card};
                      :hover {
                        box-shadow: ${theme.effect.cardHover};
                      }
                      @media (max-width: ${BREAKPOINT.small}px) {
                        padding: 10px 16px;
                        border-radius: 8px;
                        width: calc(100% - 16px * 2);
                      }
                    `}
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
              <LoadMore
                hasMore={hasMore}
                isLoadingMore={isLoadingMore}
                onLoadMore={loadMore}
                css={css`
                  width: 100%;
                `}
              />
            </ul>
          ) : (
            <Placeholder />
          )}
        </div>
      </div>
    )
  )
}
