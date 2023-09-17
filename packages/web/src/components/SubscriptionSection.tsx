import { SUBSCRIPTION_PATH } from '#/App'
import OrderedItem from '#/components/OrderedItem'
import OrderedList from '#/components/OrderedList'
import PublicationLink from '#/components/PublicationLink'
import Section, { SectionHeader, SectionTitle } from '#/components/Section'
import { BREAKPOINT } from '#/shared'
import { css } from '@emotion/react'
import { IconButton } from '@yiwen-ai/component'
import { buildPublicationKey, type PublicationOutput } from '@yiwen-ai/store'
import { useMemo } from 'react'
import { useIntl } from 'react-intl'
import { useResizeDetector } from 'react-resize-detector'
import { Link } from 'react-router-dom'
import Loading from './Loading'

const LIMIT = 6

export default function SubscriptionSection({
  title,
  isLoading,
  items: _items,
  onView,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  title: string
  isLoading: boolean
  items: PublicationOutput[]
  onView: (item: PublicationOutput) => void
}) {
  const intl = useIntl()
  const { width = 0, ref } = useResizeDetector<HTMLDivElement>()
  const isNarrow = width <= BREAKPOINT.small
  const items = useMemo(() => _items.slice(0, LIMIT), [_items])

  return (
    <Section
      ref={ref}
      header={
        <SectionHeader
          css={
            !isNarrow &&
            css`
              padding: 0 20px 0 32px;
            `
          }
        >
          <SectionTitle iconName='wanchain' label={title} active={true} />
          <Link
            to={SUBSCRIPTION_PATH}
            css={css`
              display: flex;
            `}
          >
            {!isNarrow && intl.formatMessage({ defaultMessage: '查看所有' })}
            <IconButton iconName='right' size='small' />
          </Link>
        </SectionHeader>
      }
      {...props}
    >
      {isLoading ? (
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
          `}
        >
          {items.map((item, index) => (
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
      )}
    </Section>
  )
}
