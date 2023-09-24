import { NEW_CREATION_PATH, SetHeaderProps } from '#/App'
import ErrorPlaceholder from '#/components/ErrorPlaceholder'
import LargeDialog from '#/components/LargeDialog'
import Loading from '#/components/Loading'
import NewCreationLink from '#/components/NewCreationLink'
import Placeholder from '#/components/Placeholder'
import PublicationViewer from '#/components/PublicationViewer'
import ResponsiveTabSection from '#/components/ResponsiveTabSection'
import SearchItem from '#/components/SearchItem'
import { BREAKPOINT } from '#/shared'
import { useSearchPage } from '#/store/useSearchPage'
import { css, useTheme } from '@emotion/react'
import {
  Button,
  Icon,
  IconButton,
  TextField,
  useToast,
} from '@yiwen-ai/component'
import {
  buildPublicationKey,
  useEnsureAuthorizedCallback,
} from '@yiwen-ai/store'
import { RGBA } from '@yiwen-ai/util'
import { useCallback } from 'react'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'

const MAX_WIDTH = 680

export default function SearchPage() {
  const intl = useIntl()
  const theme = useTheme()
  const { renderToastContainer, pushToast } = useToast()
  const ensureAuthorized = useEnsureAuthorizedCallback()

  const {
    isLoading,
    error,
    data,
    keyword,
    setKeyword,
    onView,
    publicationViewer: {
      open: publicationViewerOpen,
      close: onPublicationViewerClose,
      ...publicationViewer
    },
    responsiveTabSection,
  } = useSearchPage(pushToast)

  const handleChange = useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      setKeyword(ev.currentTarget.value)
    },
    [setKeyword]
  )

  const handleClear = useCallback(() => {
    setKeyword('')
  }, [setKeyword])

  return (
    <>
      {renderToastContainer()}
      <SetHeaderProps
        brand={true}
        css={css`
          @media (max-width: ${BREAKPOINT.small}px) {
            > a > svg:nth-of-type(2) {
              display: none;
            }
          }
        `}
      >
        <div
          css={css`
            flex: 1;
            margin: 0 36px;
            display: flex;
            justify-content: flex-end;
          `}
        >
          <Link to={NEW_CREATION_PATH} onClick={ensureAuthorized}>
            <Button color='primary' variant='text'>
              {intl.formatMessage({ defaultMessage: '创作内容' })}
            </Button>
          </Link>
        </div>
      </SetHeaderProps>
      <div
        css={css`
          flex: 1;
          padding: 60px 100px;
          overflow-y: auto;
          display: flex;
          flex-wrap: wrap;
          align-items: flex-start;
          justify-content: space-between;
          gap: 60px 100px;
          @media (max-width: ${BREAKPOINT.small}px) {
            padding: 24px;
            gap: 48px;
          }
        `}
      >
        <div
          css={css`
            flex: 1 100%;
            max-width: ${MAX_WIDTH}px;
            display: flex;
            flex-direction: column;
          `}
        >
          {isLoading ? (
            <Loading />
          ) : error ? (
            <ErrorPlaceholder error={error} />
          ) : data && !data.hits?.length ? (
            <Placeholder />
          ) : data?.hits?.length ? (
            <div
              css={css`
                margin-top: -16px;
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
            width: 100%;
            max-width: 360px;
            display: flex;
            flex-direction: column;
            gap: 24px;
            @media (max-width: ${BREAKPOINT.small}px) {
              gap: 48px;
            }
          `}
        >
          <NewCreationLink />
          <ResponsiveTabSection
            {...responsiveTabSection}
            css={css`
              gap: inherit;
            `}
          />
        </div>
      </div>
      <div
        css={css`
          padding: 44px 100px;
          @media (max-width: ${BREAKPOINT.small}px) {
            padding: 24px;
          }
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
                <IconButton
                  iconName='closecircle2'
                  iconSize='medium'
                  shape='circle'
                  onClick={handleClear}
                  css={css`
                    color: ${RGBA(theme.color.body.default, 0.4)};
                  `}
                />
              ) : null}
              <IconButton iconName='upload' iconSize='medium' shape='rounded' />
              <IconButton iconName='link2' iconSize='medium' shape='rounded' />
            </div>
          )}
          autoFocus={true} // eslint-disable-line jsx-a11y/no-autofocus
          placeholder={intl.formatMessage({
            defaultMessage: '搜索 yiwen.ai 的内容',
          })}
          value={keyword}
          onChange={handleChange}
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
        <LargeDialog open={true} onClose={onPublicationViewerClose}>
          <PublicationViewer
            responsive={true}
            onClose={onPublicationViewerClose}
            {...publicationViewer}
          />
        </LargeDialog>
      )}
    </>
  )
}
