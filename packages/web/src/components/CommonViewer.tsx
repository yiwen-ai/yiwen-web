import { GROUP_DETAIL_PATH } from '#/App'
import { MAX_WIDTH } from '#/shared'
import { type GroupViewType } from '#/store/useGroupDetailPage'
import { css, useTheme } from '@emotion/react'
import { type JSONContent } from '@tiptap/core'
import { RichTextEditor } from '@yiwen-ai/component'
import {
  decode,
  isRTL,
  type CreationOutput,
  type PublicationOutput,
} from '@yiwen-ai/store'
import { useMemo } from 'react'
import { Link, generatePath } from 'react-router-dom'
import { Xid } from 'xid-ts'
import CreatedBy from './CreatedBy'

export default function CommonViewer({
  type,
  item,
  isNarrow,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  type: GroupViewType
  item: CreationOutput | PublicationOutput | undefined
  isNarrow: boolean
}) {
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
        ${isNarrow &&
        css`
          padding: 0 16px;
        `}
      `}
    >
      <div
        role='heading'
        aria-level={1}
        css={css`
          ${theme.typography.h1}
          overflow-wrap: break-word;
          ${isNarrow &&
          css`
            ${theme.typography.h2}
          `}
        `}
      >
        {item.title}
      </div>
      <Link
        to={{
          pathname: generatePath(GROUP_DETAIL_PATH, {
            gid: Xid.fromValue(item.gid).toString(),
          }),
          search: new URLSearchParams({ type }).toString(),
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
        <RichTextEditor
          editable={false}
          content={content}
          css={css`
            margin-top: 24px;
            margin-bottom: 48px;
            ${isNarrow &&
            css`
              margin-top: 20px;
              margin-bottom: 24px;
            `}
          `}
        />
      )}
    </div>
  ) : null
}
