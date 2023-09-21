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
} from '@yiwen-ai/component'
import {
  type GPT_MODEL,
  type PublicationOutput,
  type UILanguageItem,
} from '@yiwen-ai/store'
import { escapeRegExp } from 'lodash-es'
import { useCallback, useMemo, useState, type HTMLAttributes } from 'react'
import { useIntl } from 'react-intl'
import { useResizeDetector } from 'react-resize-detector'
import ChargeDialog, { type ChargeDialogProps } from './ChargeDialog'
import CommonViewer from './CommonViewer'
import ErrorPlaceholder from './ErrorPlaceholder'
import Loading from './Loading'
import TranslateConfirmDialog, {
  type TranslateConfirmDialogProps,
} from './TranslateConfirmDialog'
import TranslateDialog, { type TranslateDialogProps } from './TranslateDialog'

export interface PublicationViewerProps extends HTMLAttributes<HTMLDivElement> {
  responsive: boolean
  isLoading: boolean
  error: unknown
  publication: PublicationOutput | undefined
  currentLanguage: UILanguageItem | undefined
  originalLanguage: UILanguageItem | undefined
  translatedLanguageList: UILanguageItem[] | undefined
  pendingLanguageList: UILanguageItem[] | undefined
  onCharge: () => void
  onTranslate: (language: UILanguageItem, model: GPT_MODEL) => void
  onSwitch: (language: UILanguageItem) => void
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
  responsive,
  isLoading,
  error,
  publication,
  currentLanguage,
  originalLanguage,
  translatedLanguageList: _translatedLanguageList,
  pendingLanguageList: _pendingLanguageList,
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
  const { width = 0, ref } = useResizeDetector<HTMLDivElement>()
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
              ${isNarrow &&
              css`
                padding: 24px 16px;
                gap: 16px;
              `}
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
                {originalLanguage?.nativeName ?? publication.from_language}
              </Button>
              {!currentLanguage || currentLanguage.isOriginal ? null : (
                <Button
                  title={intl.formatMessage({ defaultMessage: '当前语言' })}
                  color='primary'
                  variant='outlined'
                  size={isNarrow ? 'small' : 'large'}
                  disabled={true}
                >
                  {currentLanguage.nativeName}
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
                            defaultMessage: '更多语言翻译',
                          })}
                        </span>
                      )}
                    </Button>
                  )}
                  css={css`
                    width: 280px;
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
                        '已翻译可直接查看，未翻译可立即翻译并查看',
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
                  {pendingLanguageList.length > 0 && (
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
                  ${isNarrow &&
                  css`
                    gap: 16px;
                  `}
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
          <CommonViewer
            type={GroupViewType.Publication}
            item={publication}
            isNarrow={isNarrow}
          />
        </>
      ) : null}
      <TranslateConfirmDialog
        onCharge={onCharge}
        onTranslate={onTranslate}
        {...translateConfirmDialog}
      />
      <TranslateDialog {...translateDialog} />
      <ChargeDialog {...chargeDialog} />
    </div>
  )
}
