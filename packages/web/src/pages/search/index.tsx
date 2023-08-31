import { NEW_CREATION_PATH, SetHeaderProps } from '#/App'
import ErrorPlaceholder from '#/components/ErrorPlaceholder'
import LargeDialog from '#/components/LargeDialog'
import LinkToCreatePage from '#/components/LinkToCreatePage'
import Loading from '#/components/Loading'
import Placeholder from '#/components/Placeholder'
import PublicationViewer from '#/components/PublicationViewer'
import RecommendedAndFavorited, {
  ARTICLE_ITEM_MIN_WIDTH,
} from '#/components/RecommendedAndFavorited'
import { useSearchPage } from '#/store/useSearchPage'
import { css, useTheme } from '@emotion/react'
import {
  Avatar,
  Button,
  Icon,
  IconButton,
  TextField,
  textEllipsis,
  useToast,
} from '@yiwen-ai/component'
import { buildPublicationKey, type SearchDocument } from '@yiwen-ai/store'
import { useLayoutEffect, useRefCallback } from '@yiwen-ai/util'
import { useCallback } from 'react'
import { useIntl } from 'react-intl'
import { Link, useSearchParams } from 'react-router-dom'

const MAX_WIDTH = 680

export default function SearchPage() {
  const intl = useIntl()
  const [searchParams, setSearchParams] = useSearchParams()
  const { renderToastContainer, pushToast } = useToast()

  const {
    isLoading,
    error,
    data,
    keyword,
    setKeyword,
    onSearch,
    onView,
    publicationViewer,
    publicationViewerOpen,
    onPublicationViewerClose,
  } = useSearchPage(pushToast, searchParams.get('q')?.trim() ?? '')

  const handleChange = useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      setKeyword(ev.currentTarget.value)
    },
    [setKeyword]
  )

  const handleClear = useCallback(() => {
    setKeyword('')
  }, [setKeyword])

  const handleSearch = useCallback(
    (keyword: string) => {
      keyword = keyword.trim()
      onSearch(keyword)
      setSearchParams({ q: keyword })
    },
    [onSearch, setSearchParams]
  )

  const [inputRef, setInputRef] = useRefCallback<HTMLInputElement>(null)
  useLayoutEffect(() => inputRef?.focus(), [inputRef])

  return (
    <>
      {renderToastContainer()}
      <SetHeaderProps brand={true}>
        <div
          css={css`
            flex: 1;
            margin: 0 36px;
            display: flex;
            justify-content: flex-end;
          `}
        >
          <Link to={NEW_CREATION_PATH}>
            <Button color='primary' variant='text'>
              {intl.formatMessage({ defaultMessage: '创作内容' })}
            </Button>
          </Link>
        </div>
      </SetHeaderProps>
      <div
        css={css`
          flex: 1;
          padding: 80px;
          overflow-y: auto;
          display: flex;
          flex-wrap: wrap;
          align-items: flex-start;
          justify-content: space-between;
          gap: 32px;
        `}
      >
        <div
          css={css`
            flex: 1;
            min-width: ${ARTICLE_ITEM_MIN_WIDTH}px;
            max-width: 680px;
            display: flex;
            flex-direction: column;
          `}
        >
          {isLoading ? (
            <Loading />
          ) : error ? (
            <ErrorPlaceholder error={error} />
          ) : data && (!data.hits || data.hits.length === 0) ? (
            <Placeholder />
          ) : data?.hits ? (
            <div
              css={css`
                margin-top: -24px;
              `}
            >
              {data.hits.map((item) => (
                <SearchItem
                  key={buildPublicationKey(item)}
                  item={item}
                  onClick={onView}
                />
              ))}
            </div>
          ) : null}
        </div>
        <div
          css={css`
            width: 360px;
            display: flex;
            flex-direction: column;
            gap: 32px;
          `}
        >
          <LinkToCreatePage />
          <RecommendedAndFavorited
            css={css`
              padding: 0 12px;
            `}
          />
        </div>
      </div>
      <div
        css={css`
          padding: 44px 80px;
        `}
      >
        <TextField
          size='large'
          before={<Icon name='search' />}
          after={() => (
            <div
              css={css`
                display: flex;
                align-items: center;
                gap: 24px;
              `}
            >
              {keyword.length > 0 ? (
                <IconButton iconName='closecircle2' onClick={handleClear} />
              ) : null}
              <IconButton iconName='upload' />
              <IconButton iconName='link2' />
            </div>
          )}
          placeholder={intl.formatMessage({
            defaultMessage: '搜索 yiwen.ai 的内容',
          })}
          value={keyword}
          onChange={handleChange}
          onSearch={handleSearch}
          ref={setInputRef}
          css={css`
            width: 100%;
            max-width: ${MAX_WIDTH}px;
            height: 48px;
            gap: 12px;
            border-radius: 20px;
          `}
        />
      </div>
      {publicationViewerOpen && (
        <LargeDialog defaultOpen={true} onClose={onPublicationViewerClose}>
          <PublicationViewer responsive={true} {...publicationViewer} />
        </LargeDialog>
      )}
    </>
  )
}

function SearchItem({
  item,
  onClick,
}: {
  item: SearchDocument
  onClick: (item: SearchDocument) => void
}) {
  const theme = useTheme()
  const groupLogo = item.group?.logo || item.group?.owner?.picture
  const groupName = item.group?.name

  const handleClick = useCallback(() => {
    onClick(item)
  }, [item, onClick])

  const handleKeyDown = useCallback(
    (ev: React.KeyboardEvent<HTMLDivElement>) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        onClick(item)
      }
    },
    [item, onClick]
  )

  return (
    <div
      role='link'
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      css={css`
        padding: 16px 0;
        border-bottom: 1px solid ${theme.color.divider.primary};
        cursor: pointer;
      `}
    >
      <div
        css={css`
          ${theme.typography.h2}
          color: ${theme.palette.primaryNormal};
        `}
      >
        {item.title}
      </div>
      {item.summary && (
        <div
          css={css`
            margin-top: 12px;
          `}
        >
          {item.summary}
        </div>
      )}
      {groupName && (
        <div
          css={css`
            margin-top: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
            color: ${theme.color.body.secondary};
          `}
        >
          {groupLogo && <Avatar src={groupLogo} alt={groupName} size='small' />}
          <div
            css={css`
              ${textEllipsis}
            `}
          >
            {groupName}
          </div>
        </div>
      )}
    </div>
  )
}
