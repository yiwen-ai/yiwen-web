import { SEARCH_PATH, SetHeaderProps } from '#/App'
import LinkToCreatePage from '#/components/LinkToCreatePage'
import RecommendedAndFavorited, {
  ARTICLE_ITEM_MIN_WIDTH,
} from '#/components/RecommendedAndFavorited'
import { css, useTheme } from '@emotion/react'
import { Avatar, Icon, Spinner, TextField } from '@yiwen-ai/component'
import { useIsMounted, useLayoutEffect, useRefCallback } from '@yiwen-ai/util'
import { useCallback, useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function Search() {
  const intl = useIntl()
  const theme = useTheme()
  const isMounted = useIsMounted()
  const [inputRef, setInputRef] = useRefCallback<HTMLInputElement>(null)
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [keyword, setKeyword] = useState(params.get('q')?.trim() ?? '')
  const [isLoading, setIsLoading] = useState(false)
  const [searchItems, setSearchItems] = useState(() => [
    // TODO: integrate with search service
    {
      id: '1',
      title: '国际货币基金组织：世界 经济展望 2023',
      content:
        '根据我们的最新预测，今年的全球增速将在 2.8%的水平上触底回升，2024年将小幅上升至 3.0%。全球通胀率将从2022年的8.7%降至今年的 7.0%和2024年的4.9%',
      author: {
        id: 'abc',
        name: '风青杨',
        picture: 'https://cdn.yiwen.pub/dev/pic/UnaHmByZDTAEUqnLfk1NeQ',
      },
      createdAt: '2023.6.8',
    },
    {
      id: '2',
      title: '国际货币基金组织中文主页',
      content:
        '旗舰出版物. 《世界 经济展望 》 · 《全球金融稳定报告》 · 《财政监测报告》 · 通胀是否将维持高位？ 答案取决于有关冲击在经济中的分布情况以及央行会做出何种响应。',
      author: {
        id: 'abc',
        name: '石若琳',
        picture: 'https://cdn.yiwen.pub/dev/pic/UnaHmByZDTAEUqnLfk1NeQ',
      },
      createdAt: '2023.6.8',
    },
  ])

  const onSearch = useCallback(
    (keyword: string) => {
      keyword = keyword.trim()
      if (!keyword) return
      setKeyword(keyword)
      navigate(
        {
          pathname: SEARCH_PATH,
          search: new URLSearchParams({ q: keyword }).toString(),
        },
        { replace: true }
      )
    },
    [navigate]
  )

  useEffect(() => {
    if (!keyword) return
    setIsLoading(true)
    new Promise((resolve) => setTimeout(resolve, 1000))
      .then(() => keyword) // TODO: integrate with search service
      .then(() => isMounted() && setSearchItems((prev) => prev.slice(0)))
      .finally(() => isMounted() && setIsLoading(false))
  }, [isMounted, keyword])

  useLayoutEffect(() => {
    inputRef?.focus()
  }, [inputRef])

  return (
    <>
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
            onSearch={onSearch}
            ref={setInputRef}
            css={css`
              flex: 1;
              height: unset;
              padding: 0;
              border: 0;
              border-radius: 0;
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
            <div
              css={css`
                margin-bottom: 48px;
                height: 100px;
                display: flex;
                align-items: center;
                justify-content: center;
              `}
            >
              <Spinner />
            </div>
          ) : (
            <ul
              css={css`
                margin-top: -24px;
              `}
            >
              {searchItems.map((item) => (
                <li
                  key={item.id}
                  css={css`
                    padding: 24px 0;
                    border-bottom: 1px solid ${theme.color.divider.primary};
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
                  <div
                    css={css`
                      margin-top: 12px;
                    `}
                  >
                    {item.content}
                  </div>
                  <div
                    css={css`
                      margin-top: 8px;
                      display: flex;
                      align-items: center;
                      color: ${theme.color.body.secondary};
                    `}
                  >
                    <Avatar
                      src={item.author.picture}
                      name={item.author.name}
                      size={20}
                    />
                    <span
                      css={css`
                        margin: 0 12px;
                      `}
                    >
                      ·
                    </span>
                    <span>{item.createdAt}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
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
    </>
  )
}
