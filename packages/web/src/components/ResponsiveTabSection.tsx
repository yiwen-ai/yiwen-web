import OrderedItem from '#/components/OrderedItem'
import OrderedList from '#/components/OrderedList'
import PublicationLink from '#/components/PublicationLink'
import Section, { SectionHeader, SectionTitle } from '#/components/Section'
import { BREAKPOINT } from '#/shared'
import { css, useTheme } from '@emotion/react'
import {
  IconButton,
  Tab,
  TabList,
  TabPanel,
  TabSection,
  type IconName,
} from '@yiwen-ai/component'
import {
  buildPublicationKey,
  type BookmarkOutput,
  type PublicationOutput,
} from '@yiwen-ai/store'
import { useCallback, useState } from 'react'
import { useIntl } from 'react-intl'
import { useResizeDetector } from 'react-resize-detector'
import { Link, type To } from 'react-router-dom'
import Loading from './Loading'

const LIMIT = 6

type TabKey = 'subscription' | 'bookmark'

interface ResponsiveTabSectionProps {
  className?: string
  tabs: {
    key: TabKey
    icon: IconName
    title: string
    more: To
    isLoading: boolean
    items: (PublicationOutput | BookmarkOutput)[]
  }[]
  onView: (item: PublicationOutput | BookmarkOutput) => void
}

export default function ResponsiveTabSection({
  className,
  tabs,
  onView,
}: ResponsiveTabSectionProps) {
  const intl = useIntl()
  const theme = useTheme()
  const { width = 0, ref } = useResizeDetector<HTMLDivElement>()
  const isNarrow = width <= BREAKPOINT.small

  const [currentTab, setCurrentTab] = useState<TabKey>('subscription')

  const currentTabMore = tabs.find((tab) => tab.key === currentTab)?.more

  const renderList = useCallback(
    (items: (PublicationOutput | BookmarkOutput)[]) => (
      <OrderedList
        css={css`
          grid-template-columns: repeat(
            auto-fill,
            minmax(min(240px, 100%), 1fr)
          );
          ${!isNarrow &&
          css`
            grid-auto-flow: column;
            grid-template-rows: repeat(
              ${Math.min(items.length, Math.ceil(LIMIT / 2))},
              auto
            );
          `}
        `}
      >
        {items.slice(0, LIMIT).map((item, index) => (
          <PublicationLink
            key={buildPublicationKey(item)}
            gid={item.gid}
            cid={item.cid}
            language={item.language}
            version={item.version}
            onClick={() => onView(item)}
          >
            <OrderedItem index={index} primary={index < LIMIT / 2}>
              {item.title}
            </OrderedItem>
          </PublicationLink>
        ))}
      </OrderedList>
    ),
    [isNarrow, onView]
  )

  return (
    <div className={className} ref={ref}>
      {isNarrow ? (
        <div
          css={css`
            display: flex;
            flex-direction: column;
            gap: 24px;
          `}
        >
          {tabs.map(({ key, icon, title, more, isLoading, items }) => (
            <Section
              key={key}
              header={
                <SectionHeader
                  css={
                    !isNarrow &&
                    css`
                      padding: 0 20px 0 32px;
                    `
                  }
                >
                  <SectionTitle iconName={icon} label={title} active={true} />
                  <Link
                    to={more}
                    css={css`
                      display: flex;
                    `}
                  >
                    {!isNarrow &&
                      intl.formatMessage({ defaultMessage: '查看所有' })}
                    <IconButton iconName='right' size='small' />
                  </Link>
                </SectionHeader>
              }
            >
              {isLoading ? <Loading /> : renderList(items)}
            </Section>
          ))}
        </div>
      ) : (
        <TabSection
          value={currentTab}
          onChange={setCurrentTab}
          css={css`
            display: flex;
            flex-direction: column;
            gap: 16px;
          `}
        >
          <TabList
            css={css`
              padding: 0 32px;
              gap: 24px;
            `}
          >
            {tabs.map(({ key, icon, title }) => (
              <Tab
                key={key}
                value={key}
                css={css`
                  ${theme.typography.body}
                  padding: unset;
                  :hover,
                  &[data-selected] {
                    background: unset;
                  }
                `}
              >
                <SectionTitle
                  iconName={icon}
                  label={title}
                  active={key === currentTab}
                />
              </Tab>
            ))}
            {currentTabMore && (
              <li
                role='none'
                css={css`
                  margin-left: auto;
                `}
              >
                <Link
                  to={currentTabMore}
                  css={css`
                    display: flex;
                  `}
                >
                  {intl.formatMessage({ defaultMessage: '查看所有' })}
                  <IconButton iconName='right' size='small' />
                </Link>
              </li>
            )}
          </TabList>
          {tabs.map(({ key, title, more, isLoading, items }) => (
            <TabPanel key={key} value={key}>
              {isLoading ? <Loading /> : renderList(items)}
            </TabPanel>
          ))}
        </TabSection>
      )}
    </div>
  )
}
