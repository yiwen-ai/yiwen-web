import { css, useTheme, type SerializedStyles } from '@emotion/react'
import { Icon, Spinner, type IconName } from '@yiwen-ai/component'
import { useIsMounted } from '@yiwen-ai/util'
import { useCallback, useState, type HTMLAttributes } from 'react'
import { useIntl } from 'react-intl'
import useResizeObserver from 'use-resize-observer'

enum Tab {
  Recommended,
  Favorited,
}

export default function RecommendedAndFavorited(
  props: HTMLAttributes<HTMLDivElement>
) {
  const intl = useIntl()
  const { ref, width = 0 } = useResizeObserver<HTMLDivElement>()
  const [tab, setTab] = useState(Tab.Recommended)
  const isMounted = useIsMounted()
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
    new Promise((resolve) => setTimeout(resolve, 1000))
      .then(() => isMounted() && setRecommendedItems((prev) => prev.slice(0)))
      .then(() => isMounted() && setFavoritedItems((prev) => prev.slice(0)))
      .catch(() => undefined)
      .finally(() => isMounted() && setIsLoading(false))
  }, [isMounted])

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
                tabIcon='wanchain'
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
                tabIcon='wanchain'
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
              min-height: 108px;
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

export const ARTICLE_ITEM_MIN_WIDTH = 200

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
    <ul
      css={css`
        display: flex;
        align-items: flex-start;
        flex-wrap: wrap;
        gap: 12px 36px;
        list-style: none;
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
    </ul>
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
        color: inherit;
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
