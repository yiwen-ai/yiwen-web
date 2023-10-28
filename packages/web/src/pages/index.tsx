import { NEW_CREATION_PATH, SetHeaderProps, ThemeContext } from '#/App'
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
  IconButton,
  TextField,
  TileButton,
  useToast,
} from '@yiwen-ai/component'
import { useEnsureAuthorizedCallback } from '@yiwen-ai/store'
import { useContext } from 'react'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'

export default function Home() {
  const intl = useIntl()
  const theme = useTheme()
  const setTheme = useContext(ThemeContext)
  const { renderToastContainer, pushToast } = useToast()
  const ensureAuthorized = useEnsureAuthorizedCallback()

  const {
    onSearch,
    publicationViewer: {
      open: publicationViewerOpen,
      close: onPublicationViewerClose,
      ...publicationViewer
    },
    responsiveTabSection,
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
          width: 100%;
          max-width: calc(820px + 24px * 2);
          margin: 120px auto;
          padding: 0 24px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          @media (max-width: ${BREAKPOINT.small}px) {
            margin: 24px auto;
          }
        `}
      >
        <div
          css={css`
            padding: 0 32px;
            @media (max-width: ${BREAKPOINT.small}px) {
              padding: 0 0;
            }
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
              defaultMessage: '智能搜索内容，用熟悉的语言来阅读',
            })}
          </div>
          <ResponsiveTabSection
            {...responsiveTabSection}
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
            @media (max-width: ${BREAKPOINT.small}px) {
              margin-top: 24px;
              padding: 24px 24px;
            }
          `}
        >
          <TextField
            size='large'
            before={<Icon name='search' />}
            placeholder={intl.formatMessage({
              defaultMessage: '搜索 yiwen.ai 的内容',
            })}
            inputtype='search'
            onEnter={onSearch}
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
                    defaultMessage: '用 AI 进行语义搜索和全文智能翻译',
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
