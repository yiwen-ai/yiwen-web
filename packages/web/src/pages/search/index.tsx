import { SetHeaderProps } from '#/App'
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
  Icon,
  TextField,
  textEllipsis,
  useToast,
} from '@yiwen-ai/component'
import { buildPublicationKey, type SearchDocument } from '@yiwen-ai/store'
import { useLayoutEffect, useRefCallback } from '@yiwen-ai/util'
import { useCallback } from 'react'
import { useIntl } from 'react-intl'
import { useSearchParams } from 'react-router-dom'

export default function SearchPage() {
  const intl = useIntl()
  const theme = useTheme()
  const [searchParams, setSearchParams] = useSearchParams()
  const { renderToastContainer, pushToast } = useToast()

  const {
    isLoading,
    error,
    data,
    keyword,
    onSearch,
    onView,
    publicationViewer,
    publicationViewerOpen,
    onPublicationViewerClose,
  } = useSearchPage(pushToast, searchParams.get('q')?.trim() ?? '')

  const handleSearch = useCallback(
    (keyword: string) => {
      const q = keyword.trim()
      if (!q) return
      onSearch(keyword)
      setSearchParams({ q })
    },
    [onSearch, setSearchParams]
  )

  const [inputRef, setInputRef] = useRefCallback<HTMLInputElement>(null)
  useLayoutEffect(() => inputRef?.focus(), [inputRef])

  return (
    <>
      {renderToastContainer()}
      <SetHeaderProps
        brand={true}
        css={css`
          box-shadow: ${theme.effect.divider};
        `}
      >
        <div
          css={css`
            flex: 1;
            align-self: stretch;
            margin: 0 40px;
            display: flex;
            ::before {
              content: '';
              margin: 12px 20px 12px 0;
              border-right: 1px solid ${theme.color.divider.primary};
            }
          `}
        >
          <TextField
            size='large'
            before={<Icon name='search' />}
            placeholder={intl.formatMessage({
              defaultMessage: '搜索 yiwen.ai 的内容',
            })}
            defaultValue={keyword}
            onSearch={handleSearch}
            ref={setInputRef}
            css={css`
              flex: 1;
              height: unset;
              padding: 0;
              border: 0;
              border-radius: 0;
              gap: 12px;
            `}
          />
        </div>
      </SetHeaderProps>
      <div
        css={css`
          margin: 0 auto;
          padding: 80px;
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
