import { css, useTheme } from '@emotion/react'
import {
  Brand,
  Header,
  Icon,
  Spinner,
  TextField,
  type IconName,
} from '@yiwen-ai/component'
import { useCallback, useState, type HTMLAttributes } from 'react'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import { usePromise } from 'react-use'

export default function Home() {
  const intl = useIntl()
  const theme = useTheme()

  const onSearch = useCallback((keyword: string) => {
    // TODO: integrate with search service
    // eslint-disable-next-line no-console
    console.log(keyword)
  }, [])

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
              placeholder={intl.formatMessage({
                defaultMessage: '搜索 yiwen.ai 的内容',
              })}
              before={<Icon name='search' />}
              onSearch={onSearch}
              css={css`
                margin-top: 16px;
                display: flex;
              `}
            />
          </div>
          <RecommendedAndFavorited
            css={css`
              margin-top: 32px;
              padding: 0 20px;
            `}
          />
          <div
            css={css`
              margin-top: 112px;
              display: flex;
              justify-content: center;
            `}
          >
            <Link
              to='/create'
              css={css`
                display: block;
                padding: 12px 24px;
                border-radius: 12px;
                background: ${theme.name === 'dark'
                  ? theme.palette.grayNormal1
                  : theme.palette.grayLight1};
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
                  {intl.formatMessage({ defaultMessage: '我有内容，去创作' })}
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
            </Link>
          </div>
        </main>
      </div>
    </div>
  )
}

enum Tab {
  Recommended,
  Favorited,
}

function RecommendedAndFavorited(props: HTMLAttributes<HTMLDivElement>) {
  const intl = useIntl()
  const theme = useTheme()
  const [tab, setTab] = useState(Tab.Recommended)
  const mounted = usePromise()
  const [isLoading, setIsLoading] = useState(false)
  const [items, setItems] = useState(() => [
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
  const onRefresh = useCallback(() => {
    setIsLoading(true)
    mounted(new Promise((resolve) => setTimeout(resolve, 1000)))
      .then(() => setItems((prev) => prev.slice(0)))
      .catch(() => undefined)
      .finally(() => setIsLoading(false))
  }, [mounted])

  return (
    <div {...props}>
      <div
        css={css`
          padding: 0 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        `}
      >
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
      </div>
      <div
        css={css`
          margin-top: 12px;
        `}
      >
        {isLoading ? (
          <div
            css={css`
              min-height: 108px;
              display: flex;
              align-items: center;
              justify-content: center;
            `}
          >
            <Spinner />
          </div>
        ) : (
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
                  min-width: 200px;
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
                    color: ${index < 3
                      ? theme.palette.primaryNormal
                      : undefined};
                  `}
                >
                  {index + 1}.
                </span>
                <span>{item.title}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
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
  currentTab: Tab
  onClick: (tab: Tab) => void
}) {
  const theme = useTheme()

  const handleClick = useCallback(() => {
    onClick(tab)
  }, [onClick, tab])

  return (
    <button
      onClick={tab === currentTab ? undefined : handleClick}
      css={css`
        display: flex;
        align-items: center;
        gap: 8px;
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
          cursor: pointer;
        `}
      >
        {tabName}
      </span>
    </button>
  )
}
