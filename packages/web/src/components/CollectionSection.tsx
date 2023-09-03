import { COLLECTION_PATH } from '#/App'
import OrderedItem from '#/components/OrderedItem'
import OrderedList from '#/components/OrderedList'
import PublicationLink from '#/components/PublicationLink'
import Section, { SectionHeader, SectionTitle } from '#/components/Section'
import { BREAKPOINT } from '#/shared'
import { css } from '@emotion/react'
import { IconButton } from '@yiwen-ai/component'
import { buildPublicationKey, type CollectionOutput } from '@yiwen-ai/store'
import { useIntl } from 'react-intl'
import { useResizeDetector } from 'react-resize-detector'
import { Link } from 'react-router-dom'
import Loading from './Loading'

export default function CollectionSection({
  isLoading,
  items,
  onView,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  isLoading: boolean
  items: CollectionOutput[]
  onView: (item: CollectionOutput) => void
}) {
  const intl = useIntl()
  const { width = 0, ref } = useResizeDetector<HTMLDivElement>()
  const isNarrow = width <= BREAKPOINT.small

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
          <SectionTitle
            iconName='heart'
            label={intl.formatMessage({ defaultMessage: '收藏' })}
            active={true}
          />
          <Link
            to={COLLECTION_PATH}
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
        <OrderedList>
          {items.map((item, index) => (
            <PublicationLink
              key={buildPublicationKey(item)}
              gid={item.gid}
              cid={item.cid}
              language={item.language}
              version={item.version}
              onClick={() => onView(item)}
              css={css`
                flex: 1 ${isNarrow ? '100%' : '240px'};
              `}
            >
              <OrderedItem index={index} primary={index < 3}>
                {item.title}
              </OrderedItem>
            </PublicationLink>
          ))}
        </OrderedList>
      )}
    </Section>
  )
}
