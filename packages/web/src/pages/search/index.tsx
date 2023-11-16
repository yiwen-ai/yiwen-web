import { NEW_CREATION_PATH, SetHeaderProps, ThemeContext } from '#/App'
import CollectionViewer from '#/components/CollectionViewer'
import CreateFromFileDialog from '#/components/CreateFromFileDialog'
import CreateFromLinkDialog from '#/components/CreateFromLinkDialog'
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
import { buildSearchKey, useEnsureAuthorizedCallback } from '@yiwen-ai/store'
import { RGBA } from '@yiwen-ai/util'
import { useCallback, useContext } from 'react'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'

const MAX_WIDTH = 680

export default function SearchPage() {
  const intl = useIntl()
  const theme = useTheme()
  const setTheme = useContext(ThemeContext)
  const { renderToastContainer, pushToast } = useToast()
  const ensureAuthorized = useEnsureAuthorizedCallback()

  const {
    isLoading,
    error,
    data,
    keyword,
    setKeyword,
    onView,
    collectionViewer: {
      open: collectionViewerOpen,
      close: onCollectionViewerClose,
      ...collectionViewer
    },
    publicationViewer: {
      open: publicationViewerOpen,
      close: onPublicationViewerClose,
      ...publicationViewer
    },
    responsiveTabSection,
    createFromFileDialog: {
      open: createFromFileDialogOpen,
      show: onCreateFromFileDialogShow,
      close: onCreateFromFileDialogClose,
      ...createFromFileDialog
    },
    createFromLinkDialog: {
      open: createFromLinkDialogOpen,
      show: onCreateFromLinkDialogShow,
      close: onCreateFromLinkDialogClose,
      ...createFromLinkDialog
    },
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
            align-items: center;
            justify-content: flex-end;
            gap: 32px;
            @media (max-width: ${BREAKPOINT.small}px) {
              gap: 16px;
            }
          `}
        >
          <Link to={NEW_CREATION_PATH} onClick={ensureAuthorized}>
            <Button color='primary' variant='text'>
              {intl.formatMessage({ defaultMessage: '创作内容' })}
            </Button>
          </Link>
          <IconButton
            iconName='celo'
            onClick={setTheme}
            css={css`
              height: 24px;
              width: 48px;
              border: 1px solid ${theme.palette.grayLight0};
              background: ${theme.color.body.background};
              color: ${theme.color.body.default};
              @media (max-width: ${BREAKPOINT.small}px) {
                width: 36px;
              }
            `}
          />
        </div>
      </SetHeaderProps>
      <div
        css={css`
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-wrap: wrap;
          align-items: flex-start;
          align-content: flex-start;
          justify-content: space-between;
          gap: 40px;
          margin: 60px auto;
          max-width: 1280px;
          @media (max-width: ${BREAKPOINT.medium}px) {
            margin: 30px auto;
            padding: 0 24px;
            gap: 24px;
          }
        `}
      >
        <div
          css={css`
            flex: 1 100%;
            max-width: ${MAX_WIDTH}px;
            width: ${MAX_WIDTH}px;
            display: flex;
            flex-direction: column;
            @media (max-width: ${BREAKPOINT.large}px) {
              max-width: 480px;
              width: 100%;
            }
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
                  key={buildSearchKey(item)}
                  item={item}
                  onClick={onView}
                />
              ))}
            </div>
          ) : null}
        </div>
        <div
          css={css`
            flex: 1;
            width: 100%;
            max-width: 360px;
            display: flex;
            flex-direction: column;
            gap: 24px;
            @media (max-width: ${BREAKPOINT.large}px) {
              max-width: 320px;
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
          margin: 40px auto;
          width: 100%;
          max-width: 1080px;
          @media (max-width: ${BREAKPOINT.large}px) {
            max-width: 840px;
          }
          @media (max-width: ${BREAKPOINT.medium}px) {
            max-width: 480px;
          }
          @media (max-width: ${BREAKPOINT.small}px) {
            max-width: 360px;
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
                gap: 20px;
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
              <IconButton
                iconName='upload'
                iconSize='medium'
                shape='rounded'
                disabled={createFromLinkDialog.isCrawling}
                onClick={onCreateFromFileDialogShow}
              />
              <IconButton
                iconName='link2'
                iconSize='medium'
                shape='rounded'
                disabled={createFromFileDialog.isUploading}
                onClick={onCreateFromLinkDialogShow}
              />
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
            padding: 0 20px;
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
      {collectionViewerOpen && (
        <LargeDialog open={true} onClose={onCollectionViewerClose}>
          <CollectionViewer
            pushToast={pushToast}
            onCharge={() => {}}
            responsive={true}
            onClose={onCollectionViewerClose}
            {...collectionViewer}
          />
        </LargeDialog>
      )}
      {createFromFileDialogOpen && (
        <CreateFromFileDialog
          open={true}
          onClose={onCreateFromFileDialogClose}
          {...createFromFileDialog}
        />
      )}
      {createFromLinkDialogOpen && (
        <CreateFromLinkDialog
          open={true}
          onClose={onCreateFromLinkDialogClose}
          {...createFromLinkDialog}
        />
      )}
    </>
  )
}
