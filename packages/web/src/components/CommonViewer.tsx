import { GROUP_DETAIL_PATH } from '#/App'
import { BREAKPOINT, MAX_WIDTH } from '#/shared'
import { GroupViewType } from '#/store/useGroupDetailPage'
import { css, useTheme } from '@emotion/react'
import { type JSONContent } from '@tiptap/core'
import { Button, Icon, RichTextViewer } from '@yiwen-ai/component'
import {
  ObjectKind,
  decode,
  isRTL,
  type CollectionChildrenOutput,
  type CreationOutput,
  type PublicationOutput,
} from '@yiwen-ai/store'
import { useMemo } from 'react'
import { useIntl } from 'react-intl'
import { Link, generatePath } from 'react-router-dom'
import { Xid } from 'xid-ts'
import CreatedBy from './CreatedBy'

export default function CommonViewer({
  type,
  item,
  isNarrow,
  prevItem,
  nextItem,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  type: GroupViewType
  item: CreationOutput | PublicationOutput | undefined
  isNarrow: boolean
  prevItem?: CollectionChildrenOutput | null | undefined
  nextItem?: CollectionChildrenOutput | null | undefined
}) {
  const intl = useIntl()
  const theme = useTheme()

  const content = useMemo(
    () => item?.content && (decode(item.content) as JSONContent),
    [item?.content]
  )

  return item ? (
    <div
      dir={isRTL(item.language) ? 'rtl' : undefined}
      {...props}
      css={css`
        width: 100%;
        max-width: calc(${MAX_WIDTH} + 36px * 2);
        margin: 0 auto;
        padding: 0 36px;
        box-sizing: border-box;
        max-height: calc(100vh - 160px);
        overflow-y: auto;
        @media (max-width: ${BREAKPOINT.small}px) {
          padding: 0 16px;
          max-height: calc(100vh - 80px);
        }
      `}
    >
      <div
        role='heading'
        aria-level={1}
        css={css`
          ${theme.typography.h1}
          overflow-wrap: break-word;
          @media (max-width: ${BREAKPOINT.small}px) {
            ${theme.typography.h2}
          }
        `}
      >
        {item.title}
      </div>
      <Link
        to={{
          pathname: generatePath(GROUP_DETAIL_PATH, {
            gid: Xid.fromValue(item.gid).toString(),
            type,
          }),
        }}
        css={css`
          margin-top: 12px;
          display: flex;
          width: fit-content;
          max-width: 100%;
        `}
      >
        {item.group_info && (
          <CreatedBy
            item={item.group_info}
            timestamp={item.updated_at || item.created_at}
            css={css`
              max-width: 100%;
            `}
          />
        )}
      </Link>
      {content && (
        <RichTextViewer
          content={content}
          css={css`
            margin-top: 24px;
            margin-bottom: 48px;
            @media (max-width: ${BREAKPOINT.small}px) {
              margin-top: 20px;
              margin-bottom: 24px;
            }
          `}
        />
      )}
      {(prevItem || nextItem) && (
        <div
          css={css`
            display: flex;
            flex-direction: row;
            justify-content: center;
            width: 100%;
            gap: 24px;
            margin-bottom: 48px;
          `}
        >
          {prevItem && (
            <Link
              reloadDocument={prevItem.kind === ObjectKind.Collection}
              unstable_viewTransition={true}
              key={Xid.fromValue(prevItem.cid).toString()}
              to={{
                pathname: generatePath(GROUP_DETAIL_PATH, {
                  gid: Xid.fromValue(prevItem.gid).toString(),
                  type:
                    prevItem.kind === ObjectKind.Collection
                      ? GroupViewType.Collection
                      : GroupViewType.Publication,
                }),
                search:
                  prevItem.kind === ObjectKind.Collection
                    ? new URLSearchParams({
                        cid: Xid.fromValue(prevItem.cid).toString(),
                      }).toString()
                    : new URLSearchParams({
                        parent: Xid.fromValue(prevItem.parent).toString(),
                        cid: Xid.fromValue(prevItem.cid).toString(),
                        language: prevItem.language,
                        version: String(prevItem.version),
                      }).toString(),
              }}
              css={css`
                display: block;
              `}
            >
              <Button
                title={intl.formatMessage({ defaultMessage: '上一篇' })}
                color='secondary'
                variant='outlined'
                size={isNarrow ? 'small' : 'large'}
                onClick={() => {}}
              >
                <Icon
                  name='arrow-up-s-line'
                  size={isNarrow ? 'small' : 'medium'}
                />
                <span>{intl.formatMessage({ defaultMessage: '上一篇' })}</span>
              </Button>
            </Link>
          )}
          {nextItem && (
            <Link
              reloadDocument={nextItem.kind === ObjectKind.Collection}
              unstable_viewTransition={true}
              key={Xid.fromValue(nextItem.cid).toString()}
              to={{
                pathname: generatePath(GROUP_DETAIL_PATH, {
                  gid: Xid.fromValue(nextItem.gid).toString(),
                  type:
                    nextItem.kind === ObjectKind.Collection
                      ? GroupViewType.Collection
                      : GroupViewType.Publication,
                }),
                search:
                  nextItem.kind === ObjectKind.Collection
                    ? new URLSearchParams({
                        cid: Xid.fromValue(nextItem.cid).toString(),
                      }).toString()
                    : new URLSearchParams({
                        parent: Xid.fromValue(nextItem.parent).toString(),
                        cid: Xid.fromValue(nextItem.cid).toString(),
                        language: nextItem.language,
                        version: String(nextItem.version),
                      }).toString(),
              }}
              css={css`
                display: block;
              `}
            >
              <Button
                title={intl.formatMessage({ defaultMessage: '下一篇' })}
                color='secondary'
                variant='outlined'
                size={isNarrow ? 'small' : 'large'}
                onClick={() => {}}
              >
                <Icon
                  name='arrow-down-s-line'
                  size={isNarrow ? 'small' : 'medium'}
                />
                <span>{intl.formatMessage({ defaultMessage: '下一篇' })}</span>
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  ) : null
}
