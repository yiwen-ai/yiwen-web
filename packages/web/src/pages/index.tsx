import { SEARCH_PATH } from '#/App'
import LinkToCreatePage from '#/components/LinkToCreatePage'
import RecommendedAndFavorited from '#/components/RecommendedAndFavorited'
import { css, useTheme } from '@emotion/react'
import { Brand, Header, Icon, TextField } from '@yiwen-ai/component'
import { useCallback } from 'react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const intl = useIntl()
  const theme = useTheme()
  const navigate = useNavigate()

  const onSearch = useCallback(
    (keyword: string) => {
      keyword = keyword.trim()
      if (!keyword) return
      navigate({
        pathname: SEARCH_PATH,
        search: new URLSearchParams({ q: keyword }).toString(),
      })
    },
    [navigate]
  )

  return (
    <div
      css={css`
        height: 100vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      `}
    >
      <Header />
      <div
        css={css`
          flex: 1;
          overflow-y: auto;
        `}
      >
        <main
          css={css`
            max-width: 856px;
            margin: 120px auto;
            padding: 24px;
            display: flex;
            flex-direction: column;
            gap: 32px;
          `}
        >
          <div>
            <Brand
              size='large'
              css={css`
                padding: 0 20px;
              `}
            />
            <div
              css={css`
                margin-top: 8px;
                padding: 0 20px;
                ${theme.typography.bodyBold}
                color: ${theme.color.body.secondary};
              `}
            >
              {intl.formatMessage({
                defaultMessage: '搜你想要的内容，用你想要的语言来阅读',
              })}
            </div>
            <TextField
              size='large'
              before={<Icon name='search' />}
              placeholder={intl.formatMessage({
                defaultMessage: '搜索 yiwen.ai 的内容',
              })}
              onSearch={onSearch}
              css={css`
                margin-top: 16px;
                display: flex;
              `}
            />
          </div>
          <div
            css={css`
              display: flex;
              flex-direction: column;
              gap: 112px;
            `}
          >
            <RecommendedAndFavorited
              css={css`
                padding: 0 20px;
              `}
            />
            <LinkToCreatePage
              css={css`
                align-self: center;
              `}
            />
          </div>
        </main>
      </div>
    </div>
  )
}
