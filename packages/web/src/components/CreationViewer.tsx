import { css } from '@emotion/react'
import { type JSONContent } from '@tiptap/core'
import { RichTextEditor, useTheme } from '@yiwen-ai/component'
import { decode, useCreation } from '@yiwen-ai/store'
import { useMemo } from 'react'
import ErrorPlaceholder from './ErrorPlaceholder'
import Loading from './Loading'

export interface CreationViewerProps {
  className?: string
  gid: string
  cid: string
}

export function CreationViewer({ className, ...props }: CreationViewerProps) {
  const theme = useTheme()

  const { creation, error, isLoading } = useCreation(props.gid, props.cid)
  const content = useMemo(
    () => creation?.content && (decode(creation.content) as JSONContent),
    [creation?.content]
  )

  return isLoading ? (
    <Loading />
  ) : error ? (
    <ErrorPlaceholder error={error} />
  ) : creation ? (
    <div className={className}>
      <div
        css={css`
          ${theme.typography.h1}
          overflow-wrap: break-word;
        `}
      >
        {creation.title}
      </div>
      {content && (
        <RichTextEditor
          editable={false}
          initialContent={content}
          css={css`
            margin-top: 32px;
          `}
        />
      )}
    </div>
  ) : null
}
