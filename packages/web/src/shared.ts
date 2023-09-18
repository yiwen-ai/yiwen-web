import { joinURL } from '@yiwen-ai/util'
import { generatePath } from 'react-router-dom'
import { Xid } from 'xid-ts'
import { SHARE_PUBLICATION_PATH } from './App'

export const MAX_WIDTH = '800px'

export const BREAKPOINT = {
  small: 480,
  medium: 960,
  large: 1440,
} as const

export function generatePublicationShareLink(
  SHARE_URL: string,
  gid: Uint8Array | string | null | undefined,
  cid: Uint8Array | string,
  language: string | null | undefined,
  version: number | string | null | undefined
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
    }
  )
}
