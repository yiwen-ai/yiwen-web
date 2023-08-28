import { type ToastAPI } from '@yiwen-ai/component'
import { useEffect } from 'react'
import { usePublicationViewer } from './usePublicationViewer'

export function useSharePublication(
  pushToast: ToastAPI['pushToast'],
  _gid: string | null | undefined,
  _cid: string | null | undefined,
  _language: string | null | undefined,
  _version: number | string | null | undefined
) {
  const { refresh, ...publicationViewer } = usePublicationViewer(
    pushToast,
    _gid,
    _cid,
    _language,
    _version
  )

  useEffect(() => {
    refresh().catch(() => {})
  }, [refresh])

  return {
    publicationViewer,
  } as const
}
