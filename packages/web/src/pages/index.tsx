import { NEW_CREATION_PATH } from '#@/App'
import { css, useTheme, type SerializedStyles } from '@emotion/react'
import {
  Avatar,
  Brand,
  Button,
  Header,
  Icon,
  Spinner,
  TextField,
  type IconName,
} from '@yiwen-ai/component'
import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type HTMLAttributes,
} from 'react'
import { useIntl } from 'react-intl'
import { Link, type LinkProps } from 'react-router-dom'
import { usePromise } from 'react-use'
import useResizeObserver from 'use-resize-observer'

export default function Home() {
  const intl = useIntl()
  const theme = useTheme()
  const mounted = usePromise()
  const inputRef = useRef<HTMLInputElement>(null)
  const [keyword, setKeyword] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isSearchLoading, setIsSearchLoading] = useState(false)
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
      setIsSearchOpen(true)
      // TODO: add search keyword to URL
      setKeyword(keyword)
      // TODO: integrate with search service
      setIsSearchLoading(true)
      mounted(new Promise((resolve) => setTimeout(resolve, 1000)))
        .then(() => setSearchItems((prev) => prev.slice(0)))
        .finally(() => setIsSearchLoading(false))
    },
    [mounted]
  )

  const onSearchDismiss = useCallback(() => {
    setKeyword('')
    setIsSearchOpen(false)
  }, [])

  useLayoutEffect(() => {
    if (isSearchOpen) inputRef.current?.focus()
  }, [isSearchOpen])

  return (
    <div
      css={css`
        height: 100vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      `}
    >
      <Header
        css={css`
          box-shadow: ${isSearchOpen ? theme.effect.divider : undefined};
        `}
      >
        {isSearchOpen && (
          <div
            css={css`
              flex: 1;
              align-self: stretch;
              margin-left: 12px;
              margin-right: 40px;
              display: flex;
            `}
          >
            <Brand
              css={css`
                align-self: center;
              `}
            />
            <i
              css={css`
                margin: 12px 20px 12px 40px;
                border-left: 1px solid ${theme.color.divider.primary};
              `}
            />
            <TextField
              size='large'
              before={<Icon name='search' />}
              placeholder={intl.formatMessage({
                defaultMessage: '搜索 yiwen.ai 的内容',
              })}
              defaultValue={keyword}
              onSearch={onSearch}
              onDismiss={onSearchDismiss}
              ref={inputRef}
              css={css`
                flex: 1;
                height: unset;
                padding: 0;
                border: 0;
                border-radius: 0;
              `}
            />
          </div>
        )}
      </Header>
      <div
        css={css`
          flex: 1;
          overflow-y: auto;
        `}
      >
        {isSearchOpen ? (
          <main
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
              {isSearchLoading ? (
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
                          ${theme.typography.h3}
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
          </main>
        ) : (
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
                defaultValue={keyword}
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
        )}
      </div>
    </div>
  )
}

function LinkToCreatePage(props: Omit<LinkProps, 'to'>) {
  const intl = useIntl()
  const theme = useTheme()

  return (
    <Link
      to={NEW_CREATION_PATH}
      {...props}
      css={css`
        display: flex;
        flex-direction: column;
      `}
    >
      <Button
        variant='outlined'
        css={css`
          padding: 12px 24px;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          text-align: left;
          border-color: transparent;
          background-color: ${theme.name === 'dark'
            ? theme.palette.grayNormal1
            : theme.palette.grayLight1} !important;
        `}
      >
        <div
          css={css`
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 24px;
          `}
        >
          <span
            css={css`
              ${theme.typography.bodyBold}
              color: ${theme.color.body.primary};
            `}
          >
            {intl.formatMessage({
              defaultMessage: '我有内容，去创作',
            })}
          </span>
          <Icon name='lampon' />
        </div>
        <div
          css={css`
            ${theme.typography.tooltip}
            color: ${theme.color.body.secondary};
          `}
        >
          {intl.formatMessage({
            defaultMessage: '获得语义检索分析，AI 以及众包翻译等更多权利',
          })}
        </div>
      </Button>
    </Link>
  )
}

enum Tab {
  Recommended,
  Favorited,
}

function RecommendedAndFavorited(props: HTMLAttributes<HTMLDivElement>) {
  const intl = useIntl()
  const { ref, width = 0 } = useResizeObserver<HTMLDivElement>()
  const [tab, setTab] = useState(Tab.Recommended)
  const mounted = usePromise()
  const [isLoading, setIsLoading] = useState(false)
  const [recommendedItems, setRecommendedItems] = useState(() => [
    // TODO: integrate with API
    {
      id: '1',
      title: intl.formatMessage({
        defaultMessage: '国际货币基金组织：世界经济展望 2023',
      }),
    },
    {
      id: '2',
      title: intl.formatMessage({
        defaultMessage: '互联网行业专题报告：AI 大模型',
      }),
    },
    {
      id: '3',
      title: intl.formatMessage({
        defaultMessage: '后疫情时代国内旅游市场情况分析',
      }),
    },
    {
      id: '4',
      title: intl.formatMessage({
        defaultMessage: '2023年世界人工智能大会报告',
      }),
    },
    {
      id: '5',
      title: intl.formatMessage({ defaultMessage: '新能源战略分析' }),
    },
    {
      id: '6',
      title: intl.formatMessage({ defaultMessage: '小说：消失的眼泪' }),
    },
  ])
  const [favoritedItems, setFavoritedItems] = useState(() => [
    // TODO: integrate with API
    {
      id: '6',
      title: intl.formatMessage({ defaultMessage: '小说：消失的眼泪' }),
    },
  ])
  const onRefresh = useCallback(() => {
    setIsLoading(true)
    mounted(new Promise((resolve) => setTimeout(resolve, 1000)))
      .then(() => setRecommendedItems((prev) => prev.slice(0)))
      .then(() => setFavoritedItems((prev) => prev.slice(0)))
      .catch(() => undefined)
      .finally(() => setIsLoading(false))
  }, [mounted])

  return (
    <div {...props} ref={ref}>
      {width >= ARTICLE_ITEM_MIN_WIDTH * 2 ? (
        <ArticleGroup
          captionContainerClassName={css`
            padding: 0 16px;
          `}
          caption={
            <>
              <TabItem
                tab={Tab.Recommended}
                tabIcon='wanchain1'
                tabName={intl.formatMessage({ defaultMessage: '推荐' })}
                currentTab={tab}
                onClick={setTab}
              />
              <TabItem
                tab={Tab.Favorited}
                tabIcon='heart'
                tabName={intl.formatMessage({ defaultMessage: '收藏' })}
                currentTab={tab}
                onClick={setTab}
              />
            </>
          }
          items={tab === Tab.Recommended ? recommendedItems : favoritedItems}
          onRefresh={onRefresh}
          isLoading={isLoading}
        />
      ) : (
        <>
          <ArticleGroup
            caption={
              <TabItem
                tab={Tab.Recommended}
                tabIcon='wanchain1'
                tabName={intl.formatMessage({ defaultMessage: '推荐' })}
              />
            }
            items={recommendedItems}
            onRefresh={onRefresh}
            isLoading={isLoading}
          />
          <ArticleGroup
            caption={
              <TabItem
                tab={Tab.Favorited}
                tabIcon='heart'
                tabName={intl.formatMessage({ defaultMessage: '收藏' })}
              />
            }
            items={favoritedItems}
            isLoading={isLoading}
            css={css`
              margin-top: 24px;
            `}
          />
        </>
      )}
    </div>
  )
}

function ArticleGroup({
  className,
  captionContainerClassName,
  caption,
  items,
  onRefresh,
  isLoading,
}: {
  className?: string
  captionContainerClassName?: SerializedStyles
  caption: JSX.Element
  items: readonly {
    id: string
    title: string
  }[]
  onRefresh?: () => void
  isLoading?: boolean
}) {
  return (
    <div className={className}>
      <div
        css={css`
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          ${captionContainerClassName}
        `}
      >
        {caption}
        {onRefresh && (
          <Icon
            name='refresh'
            size='small'
            aria-hidden={false}
            onClick={isLoading ? undefined : onRefresh} // TODO: disable button when loading
            css={css`
              margin-left: auto;
              cursor: pointer;
            `}
          />
        )}
      </div>
      <div
        css={css`
          margin-top: 12px;
        `}
      >
        {isLoading ? (
          <div
            css={css`
              min-height: 100px;
              display: flex;
              align-items: center;
              justify-content: center;
            `}
          >
            <Spinner />
          </div>
        ) : (
          <ArticleList items={items} />
        )}
      </div>
    </div>
  )
}

const ARTICLE_ITEM_MIN_WIDTH = 200

function ArticleList({
  items,
}: {
  items: readonly {
    id: string
    title: string
  }[]
}) {
  const theme = useTheme()

  return (
    <ol
      css={css`
        display: flex;
        align-items: flex-start;
        flex-wrap: wrap;
        gap: 12px 36px;
      `}
    >
      {items.map((item, index) => (
        <li
          key={item.id}
          css={css`
            flex: 1 calc(50% - 36px / 2);
            min-width: ${ARTICLE_ITEM_MIN_WIDTH}px;
            margin: 0 -12px;
            padding: 0 12px;
            box-sizing: border-box;
            border-radius: 8px;
            cursor: pointer;
            :hover {
              background: ${theme.name === 'dark'
                ? theme.palette.grayNormal1
                : theme.palette.grayLight1};
            }
          `}
        >
          <span
            css={css`
              margin-right: 4px;
              color: ${index < 3 ? theme.palette.primaryNormal : undefined};
            `}
          >
            {index + 1}.
          </span>
          <span>{item.title}</span>
        </li>
      ))}
    </ol>
  )
}

function TabItem({
  tab,
  tabIcon,
  tabName,
  currentTab,
  onClick,
}: {
  tab: Tab
  tabIcon: IconName
  tabName: string
  currentTab?: Tab
  onClick?: (tab: Tab) => void
}) {
  const theme = useTheme()

  const handleClick = useCallback(() => onClick?.(tab), [onClick, tab])

  return (
    <button
      onClick={tab === currentTab ? undefined : handleClick}
      css={css`
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: ${onClick ? 'pointer' : undefined};
      `}
    >
      <Icon name={tabIcon} size='small' />
      <span
        css={css`
          ${tab === currentTab
            ? theme.typography.bodyBold
            : theme.typography.body}
          color: ${tab === currentTab
            ? theme.color.body.primary
            : theme.color.body.secondary};
        `}
      >
        {tabName}
      </span>
    </button>
  )
}
