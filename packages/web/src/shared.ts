import { Editor, findChildren, type JSONContent } from '@tiptap/core'
import { getExtensions } from '@yiwen-ai/component'
import {
  shouldUpload,
  useUploadAPI,
  type PostFilePolicy,
} from '@yiwen-ai/store'
import { joinURL } from '@yiwen-ai/util'
import { useCallback, useEffect, useState, type ImgHTMLAttributes } from 'react'
import { useIntl } from 'react-intl'
import { generatePath } from 'react-router-dom'
import { forkJoin, lastValueFrom, tap } from 'rxjs'
import { Xid } from 'xid-ts'
import { SHARE_PUBLICATION_PATH } from './App'

export const MAX_WIDTH = '800px'

export const BREAKPOINT = {
  small: 480,
  medium: 960,
  large: 1280,
} as const

export function useIsNarrow() {
  const check = () =>
    typeof window !== 'undefined' && window.innerWidth <= BREAKPOINT.small

  const [isNarrow, setIsNarrow] = useState(check)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleResize = () => setIsNarrow(check())
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return isNarrow
}

export function generatePublicationShareLink(
  SHARE_URL: string,
  gid: Uint8Array | string | null | undefined,
  cid: Uint8Array | string,
  language: string | null | undefined,
  version: number | string | null | undefined,
  by: string | null | undefined
) {
  return joinURL(
    SHARE_URL,
    generatePath(SHARE_PUBLICATION_PATH, {
      cid: Xid.fromValue(cid).toString(),
    }),
    {
      gid: gid && Xid.fromValue(gid).toString(),
      language,
      version,
      by,
    }
  )
}

export function useUploadDocumentImages() {
  const intl = useIntl()
  const { uploadFromBlobURL } = useUploadAPI()

  return useCallback(
    async (
      content: JSONContent | null | undefined,
      getUploadPolicy: () => Promise<PostFilePolicy>
    ) => {
      if (!content) return null

      const editor = new Editor({ content, extensions: getExtensions() })
      const imageNodes = findChildren(
        editor.state.doc,
        (node) =>
          node.type.name === 'image' &&
          shouldUpload((node.attrs as ImgHTMLAttributes<HTMLImageElement>).src)
      )

      if (imageNodes.length === 0) return null

      const uploadPolicy = await getUploadPolicy()

      await lastValueFrom(
        forkJoin(
          imageNodes.map(({ node, pos }) => {
            const attrs = node.attrs as ImgHTMLAttributes<HTMLImageElement>
            const src = attrs.src as string
            const fileName =
              attrs.alt ||
              attrs.title ||
              intl.formatMessage({ defaultMessage: '图片' })
            return uploadFromBlobURL(uploadPolicy, src, fileName).pipe(
              tap(({ value: url }) => {
                attrs.src = url
              })
            )
          })
        )
      )

      return editor.getJSON()
    },
    [intl, uploadFromBlobURL]
  )
}
