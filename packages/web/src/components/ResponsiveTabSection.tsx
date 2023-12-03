import CollectionLink from '#/components/CollectionLink'
import OrderedItem from '#/components/OrderedItem'
import OrderedList from '#/components/OrderedList'
import PublicationLink from '#/components/PublicationLink'
import Section, { SectionHeader, SectionTitle } from '#/components/Section'
import { type ResponsiveTabItem } from '#/store/useResponsiveTabSection'
import { css } from '@emotion/react'
import { IconButton } from '@yiwen-ai/component'
import {
  ObjectKind,
  buildCollectionKey,
  buildPublicationKey,
  type ObjectParams,
  type PublicationOutput,
} from '@yiwen-ai/store'
import { useCallback } from 'react'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import Loading from './Loading'

interface ResponsiveTabSectionProps {
  isNarrow: boolean
  className?: string
  items: ResponsiveTabItem[]
  onView: (item: ObjectParams) => void
}

export default function ResponsiveTabSection({
  isNarrow,
  className,
  items,
  onView,
}: ResponsiveTabSectionProps) {
  const intl = useIntl()
  const LIMIT = isNarrow ? 3 : 6

  const renderList = useCallback(
    (isLoading: boolean, items: ObjectParams[]) => {
      return isLoading ? (
        <Loading />
      ) : (
        <OrderedList
          css={css`
            display: block;
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
            items.slice(0, LIMIT).map((item, index) =>
              item.kind === ObjectKind.Collection ? (
                <CollectionLink
                  key={buildCollectionKey(
                    item.gid as Uint8Array,
                    item.cid as Uint8Array
                  )}
                  gid={item.gid as Uint8Array}
                  cid={item.cid as Uint8Array}
                  onClick={() => onView(item)}
                >
                  <OrderedItem index={index} primary={index < LIMIT / 2}>
                    {'#' +
                      intl.formatMessage({ defaultMessage: '合集' }) +
                      ' ' +
                      item.title}
                  </OrderedItem>
                </CollectionLink>
              ) : (
                <PublicationLink
                  key={buildPublicationKey(item as PublicationOutput)}
                  gid={item.gid as Uint8Array}
                  cid={item.cid as Uint8Array}
                  language={item.language as string}
                  version={item.version as number}
                  onClick={() => onView(item)}
                >
                  <OrderedItem index={index} primary={index < LIMIT / 2}>
                    {item.title}
                  </OrderedItem>
                </PublicationLink>
              )
            )
          )}
        </OrderedList>
      )
    },
    [intl, LIMIT, onView]
  )

  return (
    <div
      className={className}
      css={css`
        display: flex;
        flex-direction: column;
        gap: 24px;
      `}
    >
      {items.map(({ key, icon, title, more, isLoading, items }) => (
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
      ))}
    </div>
  )
}
