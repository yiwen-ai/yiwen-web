import { BREAKPOINT, MAX_WIDTH, generatePublicationShareLink } from '#/shared'
import { css } from '@emotion/react'
import { type JSONContent } from '@tiptap/core'
import {
  AlertDialog,
  AlertDialogBody,
  Button,
  Icon,
  IconButton,
  Menu,
  MenuItem,
  RichTextEditor,
  Select,
  SelectOption,
  SelectOptionGroup,
  Spinner,
  useTheme,
  useToast,
} from '@yiwen-ai/component'
import {
  decode,
  toMessage,
  useFetcherConfig,
  useLanguageList,
  usePublication,
  useRelatedPublicationList,
  type PublicationOutput,
} from '@yiwen-ai/store'
import { isTruthy } from '@yiwen-ai/util'
import { groupBy, without } from 'lodash-es'
import { useCallback, useMemo, type HTMLAttributes } from 'react'
import { useIntl } from 'react-intl'
import { useResizeDetector } from 'react-resize-detector'
import { CreatedBy } from './CreatedBy'
import ErrorPlaceholder from './ErrorPlaceholder'
import Loading from './Loading'

export interface PublicationViewerProps extends HTMLAttributes<HTMLDivElement> {
  gid: string
  cid: string
  language: string
  version: number | string
  onSwitch: (publication: PublicationOutput) => void
}

export function PublicationViewer({
  gid,
  cid,
  language: _language,
  version: _version,
  onSwitch,
  ...props
}: PublicationViewerProps) {
  const intl = useIntl()
  const theme = useTheme()
  const { render, push } = useToast()
  const { width = 0, ref } = useResizeDetector<HTMLDivElement>()
  const isNarrow = width <= BREAKPOINT.small

  //#region publication
  const { publication, error, isLoading, translatingLanguage, translate } =
    usePublication(gid, cid, _language, _version)
  const content = useMemo(
    () => publication?.content && (decode(publication.content) as JSONContent),
    [publication?.content]
  )
  //#endregion

  //#region language
  const language = publication?.language ?? _language
  const version = publication?.version ?? _version

  const { languageList: _languageList, preferredLanguageCodeList } =
    useLanguageList()
  const { publicationList: relatedPublicationList } = useRelatedPublicationList(
    gid,
    cid
  )

  const languageList = useMemo(() => {
    return (
      relatedPublicationList &&
      _languageList?.map(([code, displayName, name]) => ({
        code,
        name,
        displayName,
        publication: relatedPublicationList.find(
          ({ language: _language, version: _version }) => {
            return _language === code && _version === version
          }
        ),
      }))
    )
  }, [_languageList, relatedPublicationList, version])

  const currentLanguage = useMemo(() => {
    return languageList?.find(({ code }) => code === language)
  }, [language, languageList])

  const [translatedLanguageList, pendingLanguageList] = useMemo(() => {
    if (!languageList) return []
    const dict = groupBy(
      languageList.filter(({ code }) => code !== language),
      ({ publication }) => !!publication
    )
    return [dict['true'] ?? [], dict['false'] ?? []]
  }, [language, languageList])

  const preferredLanguageList = useMemo(() => {
    return (
      languageList &&
      without(preferredLanguageCodeList, language)
        .map((code) => languageList.find(({ code: _code }) => _code === code))
        .filter(isTruthy)
        .slice(0, 1) // show only one preferred language
    )
  }, [language, languageList, preferredLanguageCodeList])

  const translatingLanguageName = useMemo(() => {
    return (
      languageList?.find(({ code }) => code === translatingLanguage)?.name ??
      translatingLanguage
    )
  }, [languageList, translatingLanguage])
  //#endregion

  //#region share
  const config = useFetcherConfig()
  const handleCopyShareLink = useCallback(async () => {
    if (!config) return
    const link = generatePublicationShareLink(
      config,
      gid,
      cid,
      _language,
      _version
    )
    await navigator.clipboard.writeText(link)
    push({
      type: 'success',
      message: intl.formatMessage({ defaultMessage: '链接已复制' }),
      description: link,
    })
  }, [_language, _version, cid, config, gid, intl, push])
  //#endregion

  const handleSelectLanguage = useCallback(
    async (code: string, publication: PublicationOutput | null | undefined) => {
      try {
        if (!publication) publication = await translate(code)
        onSwitch(publication)
      } catch (error) {
        push({
          type: 'warning',
          message: intl.formatMessage({ defaultMessage: '翻译失败' }),
          description: toMessage(error),
        })
      }
    },
    [intl, onSwitch, push, translate]
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
      {render()}
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
              color='primary'
              variant='outlined'
              size={isNarrow ? 'small' : 'large'}
              disabled={true}
            >
              {currentLanguage?.name ?? language}
            </Button>
            {preferredLanguageList?.map(({ code, name, publication }) => (
              <Button
                key={code}
                color='primary'
                variant='outlined'
                size={isNarrow ? 'small' : 'large'}
                onClick={() => handleSelectLanguage(code, publication)}
              >
                {name}
              </Button>
            ))}
            {translatedLanguageList && pendingLanguageList && (
              <Select
                anchor={(props) => (
                  <Button
                    color='secondary'
                    size={isNarrow ? 'small' : 'large'}
                    {...props}
                    css={css`
                      gap: 12px;
                    `}
                  >
                    <Icon
                      name='translate3'
                      size={isNarrow ? 'small' : 'medium'}
                    />
                    {isNarrow
                      ? null
                      : intl.formatMessage({ defaultMessage: '更多语言翻译' })}
                  </Button>
                )}
              >
                {currentLanguage && (
                  <SelectOption
                    label={intl.formatMessage(
                      { defaultMessage: '{name}（创作语言）' },
                      { name: currentLanguage.name }
                    )}
                    value={currentLanguage.code}
                  />
                )}
                {translatedLanguageList.length > 0 && (
                  <SelectOptionGroup
                    label={intl.formatMessage({ defaultMessage: '已翻译' })}
                  >
                    {translatedLanguageList.map((item) => (
                      <SelectOption
                        key={item.code}
                        label={item.name}
                        value={item.code}
                        onSelect={() =>
                          handleSelectLanguage(item.code, item.publication)
                        }
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
                        label={item.name}
                        value={item.code}
                        onSelect={() =>
                          handleSelectLanguage(item.code, item.publication)
                        }
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
                <IconButton iconName='heart3' />
              ) : (
                <Button color='secondary'>
                  <Icon name='heart' size='small' />
                  {intl.formatMessage({ defaultMessage: '收藏' })}
                </Button>
              )}
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
                  onClick={handleCopyShareLink}
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
                  onClick={() => {}}
                />
              </Menu>
            </div>
          </div>
          <div
            css={css`
              max-width: ${MAX_WIDTH};
              margin: 0 auto;
              padding: 0 80px;
              ${isNarrow &&
              css`
                padding: 0 16px;
              `}
            `}
          >
            <div
              css={css`
                ${theme.typography.h1}
                overflow-wrap: break-word;
                ${isNarrow &&
                css`
                  ${theme.typography.h2}
                `}
              `}
            >
              {publication.title}
            </div>
            <CreatedBy
              item={publication}
              css={css`
                margin-top: 16px;
              `}
            />
            {content && (
              <RichTextEditor
                editable={false}
                initialContent={content}
                css={css`
                  margin-top: 32px;
                  margin-bottom: 48px;
                  ${isNarrow &&
                  css`
                    margin-top: 20px;
                    margin-bottom: 24px;
                  `}
                `}
              />
            )}
          </div>
        </>
      ) : null}
      {translatingLanguage && (
        <AlertDialog defaultOpen={true}>
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
                  language: translatingLanguageName,
                }
              )}
            </div>
          </AlertDialogBody>
        </AlertDialog>
      )}
    </div>
  )
}
