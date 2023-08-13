import { type JSONContent } from '@tiptap/core'
import { RichTextEditor } from '@yiwen-ai/component'
import { decode, toMessage, useCreation } from '@yiwen-ai/store'
import { useMemo } from 'react'
import Loading from './Loading'

export interface CreationViewerProps {
  gid: string
  cid: string
}

export function CreationViewer(props: CreationViewerProps) {
  const { creation, error, isLoading } = useCreation(props.gid, props.cid)
  const content = useMemo(
    () => creation?.content && (decode(creation.content) as JSONContent),
    [creation?.content]
  )

  return isLoading ? (
    <Loading />
  ) : error ? (
    <div>{toMessage(error)}</div>
  ) : creation ? (
    <div>
      {content && <RichTextEditor editable={false} initialContent={content} />}
    </div>
  ) : null
}
