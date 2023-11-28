import { GROUP_DETAIL_PATH } from '#/App'
import { BREAKPOINT, MAX_WIDTH } from '#/shared'
import { type GroupViewType } from '#/store/useGroupDetailPage'
import { css, useTheme } from '@emotion/react'
import { type JSONContent } from '@tiptap/core'
import { RichTextViewer } from '@yiwen-ai/component'
import {
  decode,
  isRTL,
  type CreationOutput,
  type PublicationOutput,
} from '@yiwen-ai/store'
import { forwardRef, useMemo } from 'react'
import { Link, generatePath } from 'react-router-dom'
import { Xid } from 'xid-ts'
import CreatedBy from './CreatedBy'

const CommonViewer = forwardRef(function CommonViewer(
  {
    type,
    item,
    isNarrow,
    gid,
    footer,
    ...props
  }: React.HTMLAttributes<HTMLDivElement> & {
    type: GroupViewType
    item: CreationOutput | PublicationOutput | undefined
    isNarrow: boolean
    gid?: string | null | undefined
    footer?: JSX.Element | null | undefined
  },
  ref: React.Ref<HTMLDivElement>
) {
  const theme = useTheme()

  const content = useMemo(
    () => item?.content && (decode(item.content) as JSONContent),
    [item?.content]
  )

  return item ? (
    <div
      ref={ref}
      dir={isRTL(item.language) ? 'rtl' : undefined}
      {...props}
      css={css`
        width: 100%;
        max-width: calc(${MAX_WIDTH} + 36px * 2);
        margin: 0 auto;
        padding: 0 36px;
        box-sizing: border-box;
        @media (max-width: ${BREAKPOINT.small}px) {
          padding: 16px;
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
      {item.summary && (
        <blockquote
          css={css`
            ${theme.typography.body}
            margin: 1em 0;
            padding: 1em 1.5em 1em 1em;
            border-left: 0.5em solid ${theme.color.body.primaryHover};
            background-color: ${theme.color.popover.background};
            border-top-right-radius: 12px;
            border-bottom-right-radius: 12px;
            box-shadow: ${theme.effect.card};
          `}
        >
          {item.summary}
        </blockquote>
      )}
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
      {footer}
    </div>
  ) : null
})

export default CommonViewer
