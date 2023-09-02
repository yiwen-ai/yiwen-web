import { SHARE_PUBLICATION_PATH } from '#/App'
import { type ToastAPI } from '@yiwen-ai/component'
import { type UILanguageItem } from '@yiwen-ai/store'
import { useCallback, useEffect } from 'react'
import { generatePath, useNavigate } from 'react-router-dom'
import { Xid } from 'xid-ts'
import { usePublicationViewer } from './usePublicationViewer'

export function useSharePublicationPage(
  pushToast: ToastAPI['pushToast'],
  _gid: string | null | undefined,
  _cid: string | null | undefined,
  _language: string | null | undefined,
  _version: string | null | undefined
) {
  const navigate = useNavigate()

  const { open, show, close, refresh, onTranslate, ...publicationViewer } =
    usePublicationViewer(pushToast)

  useEffect(() => {
    show(_gid, _cid, _language, _version)
  }, [_cid, _gid, _language, _version, show])

  const handleTranslate = useCallback(
    async (language: UILanguageItem) => {
      const publication = await onTranslate(language)
      if (!publication) return
      navigate({
        pathname: generatePath(SHARE_PUBLICATION_PATH, {
          cid: Xid.fromValue(publication.cid).toString(),
        }),
        search: new URLSearchParams({
          gid: Xid.fromValue(publication.gid).toString(),
          language: publication.language,
          version: publication.version.toString(),
        }).toString(),
      })
    },
    [navigate, onTranslate]
  )

  return {
    publicationViewer: {
      ...publicationViewer,
      onTranslate: handleTranslate,
    },
  } as const
}
