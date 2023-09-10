import {
  BOOKMARK_PATH,
  NEW_CREATION_PATH,
  SUBSCRIPTION_PATH,
  SetHeaderProps,
} from '#/App'
import LargeDialog from '#/components/LargeDialog'
import PublicationViewer from '#/components/PublicationViewer'
import ResponsiveTabSection from '#/components/ResponsiveTabSection'
import { BREAKPOINT } from '#/shared'
import { useHomePage } from '#/store/useHomePage'
import { css, useTheme } from '@emotion/react'
import {
  Brand,
  Button,
  Icon,
  TextField,
  TileButton,
  useToast,
} from '@yiwen-ai/component'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'

export default function Home() {
  const intl = useIntl()
  const theme = useTheme()
  const { renderToastContainer, pushToast } = useToast()

  const {
    onSearch,
    onView,
    publicationViewer: {
      open: publicationViewerOpen,
      close: onPublicationViewerClose,
      ...publicationViewer
    },
    subscriptionList,
    bookmarkList,
  } = useHomePage(pushToast)

  return (
    <>
      {renderToastContainer()}
      <SetHeaderProps>
        <div
          css={css`
            flex: 1;
            margin: 0 36px;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 36px;
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
          width: 100%;
          max-width: calc(820px + 24px * 2);
          margin: 120px auto;
          padding: 0 24px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
        `}
      >
        <div
          css={css`
            padding: 0 32px;
          `}
        >
          <Brand size='large' />
          <div
            css={css`
              margin-top: 12px;
              ${theme.typography.bodyBold}
              color: ${theme.color.body.secondary};
            `}
          >
            {intl.formatMessage({
              defaultMessage: '搜你想要的内容，用你想要的语言来阅读',
            })}
          </div>
          <ResponsiveTabSection
            tabs={[
              {
                key: 'subscription',
                icon: 'wanchain',
                title: intl.formatMessage({ defaultMessage: '订阅更新' }),
                more: SUBSCRIPTION_PATH,
                isLoading: subscriptionList.isLoading,
                items: subscriptionList.items,
              },
              {
                key: 'bookmark',
                icon: 'heart',
                title: intl.formatMessage({ defaultMessage: '书签' }),
                more: BOOKMARK_PATH,
                isLoading: bookmarkList.isLoading,
                items: bookmarkList.items,
              },
            ]}
            onView={onView}
            css={css`
              margin-top: 48px;
            `}
          />
        </div>
        <div
          css={css`
            margin-top: 100px;
            padding: 24px 36px;
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: center;
            gap: 24px 36px;
            border-radius: 30px;
            background: ${theme.color.button.tile.background};
          `}
        >
          <TextField
            size='large'
            before={<Icon name='search' />}
            placeholder={intl.formatMessage({
              defaultMessage: '搜索 yiwen.ai 的内容',
            })}
            onSearch={onSearch}
            css={css`
              flex: 1;
              height: 48px;
              padding: 0 20px;
              border-radius: 20px;
              background: ${theme.color.body.background};
              @media (min-width: ${BREAKPOINT.small}px) {
                :focus-within + a {
                  position: absolute;
                  right: 0;
                  width: 0;
                  height: 0;
                  overflow: hidden;
                }
              }
            `}
          />
          <Link to={NEW_CREATION_PATH}>
            <TileButton
              css={css`
                padding: unset;
                border: unset;
                gap: 16px;
              `}
            >
              <div>
                <div
                  css={css`
                    display: flex;
                    align-items: center;
                    gap: 8px;
                  `}
                >
                  <span css={theme.typography.bodyBold}>
                    {intl.formatMessage({
                      defaultMessage: '我有内容，去创作',
                    })}
                  </span>
                  <Icon name='lampon' size='small' />
                </div>
                <div
                  css={css`
                    ${theme.typography.tooltip}
                    color: ${theme.color.body.secondary};
                  `}
                >
                  {intl.formatMessage({
                    defaultMessage:
                      '获得语义检索分析，AI 以及众包翻译等更多权利',
                  })}
                </div>
              </div>
              <Icon
                name='arrowcircleright'
                css={css`
                  opacity: 0.4;
                `}
              />
            </TileButton>
          </Link>
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
