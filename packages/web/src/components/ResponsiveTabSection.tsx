import OrderedItem from '#/components/OrderedItem'
import OrderedList from '#/components/OrderedList'
import PublicationLink from '#/components/PublicationLink'
import Section, { SectionHeader, SectionTitle } from '#/components/Section'
import { BREAKPOINT } from '#/shared'
import {
  type ResponsiveTabItem,
  type ResponsiveTabKey,
} from '#/store/useResponsiveTabSection'
import { css } from '@emotion/react'
import {
  IconButton,
  Tab,
  TabList,
  TabPanel,
  TabSection,
} from '@yiwen-ai/component'
import {
  buildPublicationKey,
  type BookmarkOutput,
  type PublicationOutput,
} from '@yiwen-ai/store'
import { useCallback, useMemo } from 'react'
import { useIntl } from 'react-intl'
import { useResizeDetector } from 'react-resize-detector'
import { Link } from 'react-router-dom'
import Loading from './Loading'

const LIMIT = 6

interface ResponsiveTabSectionProps {
  className?: string
  value: ResponsiveTabKey
  onChange: (value: ResponsiveTabKey) => void
  items: ResponsiveTabItem[]
  onView: (item: PublicationOutput | BookmarkOutput) => void
}

export default function ResponsiveTabSection({
  className,
  value,
  onChange,
  items,
  onView,
}: ResponsiveTabSectionProps) {
  const intl = useIntl()
  const { width = 0, ref } = useResizeDetector<HTMLDivElement>()
  const isNarrow = width <= BREAKPOINT.small

  const currentTabMore = useMemo(
    () => items.find((tab) => tab.key === value)?.more,
    [items, value]
  )

  const renderList = useCallback(
    (isLoading: boolean, items: (PublicationOutput | BookmarkOutput)[]) => {
      return isLoading ? (
        <Loading />
      ) : (
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
            ${items.length === 0 &&
            css`
              display: block;
            `}
          `}
        >
          {items.length === 0 ? (
            <div
              css={(theme) => css`
                padding: 20px;
                text-align: center;
                color: ${theme.color.body.secondary};
                ${theme.typography.tooltip}
              `}
            >
              {intl.formatMessage({ defaultMessage: '暂无数据' })}
            </div>
          ) : (
            items.slice(0, LIMIT).map((item, index) => (
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
            ))
          )}
        </OrderedList>
      )
    },
    [intl, isNarrow, onView]
  )

  return (
    <div
      className={className}
      ref={ref}
      css={css`
        display: flex;
        flex-direction: column;
        gap: 24px;
      `}
    >
      {isNarrow ? (
        items.map(({ key, icon, title, more, isLoading, items }) => (
          <Section
            key={key}
            header={
              <SectionHeader>
                <SectionTitle iconName={icon} label={title} active={true} />
                <Link
                  to={more}
                  css={css`
                    display: flex;
                  `}
                >
                  <IconButton iconName='right' size='small' />
                </Link>
              </SectionHeader>
            }
          >
            {renderList(isLoading, items)}
          </Section>
        ))
      ) : (
        <TabSection
          value={value}
          onChange={onChange}
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
              border: unset;
            `}
          >
            {items.map(({ key, icon, title }) => (
              <Tab
                key={key}
                value={key}
                css={css`
                  padding: unset;
                  :hover,
                  &[data-selected] {
                    background: unset;
                    ::after {
                      content: none;
                    }
                  }
                `}
              >
                <SectionTitle
                  iconName={icon}
                  label={title}
                  active={key === value}
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
          {items.map(({ key, isLoading, items }) => (
            <TabPanel key={key} value={key}>
              {renderList(isLoading, items)}
            </TabPanel>
          ))}
        </TabSection>
      )}
    </div>
  )
}
