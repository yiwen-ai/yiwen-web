import { type JSONContent } from '@tiptap/core'
import { RichTextEditor } from '@yiwen-ai/component'
import { decode, toMessage, usePublication } from '@yiwen-ai/store'
import { useMemo } from 'react'
import Loading from './Loading'

export interface PublicationViewerProps {
  gid: string
  cid: string
  language: string
  version: number | string
}

export function PublicationViewer(props: PublicationViewerProps) {
  const { publication, error, isLoading } = usePublication(
    props.gid,
    props.cid,
    props.language,
    props.version
  )
  const content = useMemo(
    () => publication?.content && (decode(publication.content) as JSONContent),
    [publication?.content]
  )

  return isLoading ? (
    <Loading />
  ) : error ? (
    <div>{toMessage(error)}</div>
  ) : publication ? (
    <div>
      {content && <RichTextEditor editable={false} initialContent={content} />}
    </div>
  ) : null
}
