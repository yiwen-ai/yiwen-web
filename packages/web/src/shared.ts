import { type FetcherConfig } from '@yiwen-ai/store'
import { joinURL } from '@yiwen-ai/util'
import { generatePath } from 'react-router-dom'
import { PUBLICATION_SHARE_PATH } from './App'

export const MAX_WIDTH = '800px'

export const BREAKPOINT = {
  small: 480,
  medium: 960,
  large: 1440,
} as const

export function generatePublicationShareLink(
  config: FetcherConfig,
  gid: string,
  cid: string,
  language: string,
  version: number | string
) {
  return joinURL(
    config.SHARE_URL,
    generatePath(PUBLICATION_SHARE_PATH, { cid }),
    {
      gid,
      language,
      version,
    }
  )
}
