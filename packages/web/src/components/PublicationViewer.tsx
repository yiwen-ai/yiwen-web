import { BREAKPOINT } from '#/shared'
import { css, useTheme } from '@emotion/react'
import {
  AlertDialog,
  AlertDialogBody,
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
  PublicationStatus,
  type Language,
  type PublicationOutput,
} from '@yiwen-ai/store'
import { escapeRegExp } from 'lodash-es'
import { useCallback, useMemo, useState, type HTMLAttributes } from 'react'
import { useIntl } from 'react-intl'
import { useResizeDetector } from 'react-resize-detector'
import CommonViewer from './CommonViewer'
import ErrorPlaceholder from './ErrorPlaceholder'
import Loading from './Loading'

export interface PublicationViewerProps extends HTMLAttributes<HTMLDivElement> {
  responsive: boolean
  isLoading: boolean
  error: unknown
  publication: PublicationOutput | undefined
  currentLanguage: Language | undefined
  originalLanguage: Language | undefined
  translatedLanguageList: Language[] | undefined
  pendingLanguageList: Language[] | undefined
  translatingLanguage: Language | undefined
  onTranslate: (language: string) => void
  shareLink: string | undefined
  onShare: () => void
  isFavorite: boolean
  isAddingFavorite: boolean
  isRemovingFavorite: boolean
  onAddFavorite: () => void
  onRemoveFavorite: () => void
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
  translatingLanguage,
  onTranslate,
  shareLink,
  onShare,
  isFavorite,
  isAddingFavorite,
  isRemovingFavorite,
  onAddFavorite,
  onRemoveFavorite,
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
              padding: 40px 80px;
              display: flex;
              flex-wrap: wrap;
              align-items: center;
              gap: 24px;
              ${isNarrow &&
              css`
                padding: 24px 16px;
                gap: 16px;
              `}
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
              disabled={!originalLanguage}
              onClick={() =>
                originalLanguage && onTranslate(originalLanguage.code)
              }
            >
              {originalLanguage?.nativeName ?? publication.from_language}
            </Button>
            {publication.language === publication.from_language ? null : (
              <Button
                title={intl.formatMessage({ defaultMessage: '当前语言' })}
                color='primary'
                variant='outlined'
                size={isNarrow ? 'small' : 'large'}
                disabled={true}
              >
                {currentLanguage?.nativeName ?? publication.language}
              </Button>
            )}
            {translatedLanguageList && pendingLanguageList && (
              <Select
                anchor={(props) => (
                  <Button
                    color='secondary'
                    size={isNarrow ? 'small' : 'large'}
                    disabled={!!translatingLanguage}
                    {...props}
                  >
                    {translatingLanguage ? (
                      <Spinner size={isNarrow ? 'small' : 'medium'} />
                    ) : (
                      <Icon
                        name='translate3'
                        size={isNarrow ? 'small' : 'medium'}
                      />
                    )}
                    {isNarrow ? null : (
                      <span css={textEllipsis}>
                        {intl.formatMessage({ defaultMessage: '更多语言翻译' })}
                      </span>
                    )}
                  </Button>
                )}
              >
                <li
                  role='none'
                  css={css`
                    list-style: none;
                    padding: 4px 8px;
                  `}
                >
                  {intl.formatMessage({
                    defaultMessage: '已翻译可直接查看，未翻译可立即翻译并查看',
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
                    label={intl.formatMessage(
                      { defaultMessage: '{name}（创作语言）' },
                      { name: originalLanguage.nativeName }
                    )}
                    value={originalLanguage.code}
                    onSelect={() => onTranslate(originalLanguage.code)}
                  />
                )}
                {translatedLanguageList.length > 0 && (
                  <SelectOptionGroup
                    label={intl.formatMessage({ defaultMessage: '已翻译' })}
                  >
                    {translatedLanguageList.map((item) => (
                      <SelectOption
                        key={item.code}
                        label={item.nativeName}
                        value={item.code}
                        onSelect={() => onTranslate(item.code)}
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
                        label={item.nativeName}
                        value={item.code}
                        onSelect={() => onTranslate(item.code)}
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
                <Button color='secondary'>
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
                    ? intl.formatMessage({ defaultMessage: '已收藏' })
                    : intl.formatMessage({ defaultMessage: '收藏' })}
                </Button>
              )}
              {publication.status === PublicationStatus.Published &&
              shareLink ? (
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
                          background: ${theme.color.menu.item.hover.background};
                        `}
                      />
                    }
                    readOnly={true}
                  />
                </Menu>
              ) : null}
            </div>
          </div>
          <CommonViewer item={publication} isNarrow={isNarrow} />
        </>
      ) : null}
      {translatingLanguage && (
        <AlertDialog open={true}>
          <AlertDialogBody
            css={css`
              padding: 48px 56px;
            `}
          >
            <Spinner />
            <div
              css={css`
                margin-top: 16px;
              `}
            >
              {intl.formatMessage(
                {
                  defaultMessage:
                    '「{language}」正在翻译，请稍后，翻译好后可在你的发布列表里进行修改和提交。',
                },
                {
                  language: translatingLanguage.nativeName,
                }
              )}
            </div>
          </AlertDialogBody>
        </AlertDialog>
      )}
    </div>
  )
}
