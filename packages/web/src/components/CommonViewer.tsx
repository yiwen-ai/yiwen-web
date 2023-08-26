import { MAX_WIDTH } from '#/shared'
import { css, useTheme } from '@emotion/react'
import { type JSONContent } from '@tiptap/core'
import { RichTextEditor } from '@yiwen-ai/component'
import {
  decode,
  type CreationOutput,
  type PublicationOutput,
} from '@yiwen-ai/store'
import { useMemo } from 'react'
import { CreatedBy } from './CreatedBy'

export default function CommonViewer({
  item,
  isNarrow,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
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
      {...props}
      css={css`
        width: 100%;
        max-width: calc(${MAX_WIDTH} + 80px * 2);
        margin: 0 auto;
        padding: 0 80px;
        box-sizing: border-box;
        ${isNarrow &&
        css`
          padding: 0 16px;
        `}
      `}
    >
      <div
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
      <CreatedBy
        item={item}
        css={css`
          margin-top: 16px;
        `}
      />
      {content && (
        <RichTextEditor
          editable={false}
          initialContent={content}
          css={css`
            margin-top: 32px;
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
