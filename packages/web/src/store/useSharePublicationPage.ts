import { SHARE_PUBLICATION_PATH } from '#/App'
import { type ToastAPI } from '@yiwen-ai/component'
import {
  PublicationStatus,
  type GPT_MODEL,
  type PublicationOutput,
  type UILanguageItem,
} from '@yiwen-ai/store'
import { toURLSearchParams } from '@yiwen-ai/util'
import { useCallback, useEffect } from 'react'
import { generatePath, useNavigate } from 'react-router-dom'
import { Xid } from 'xid-ts'
import { usePublicationViewer } from './usePublicationViewer'

export function useSharePublicationPage(
  pushToast: ToastAPI['pushToast'],
  _gid: string | null | undefined,
  _cid: string | null | undefined,
  _language: string | null | undefined,
  _version: string | null | undefined,
  _by: string | null | undefined
) {
  const navigate = useNavigate()

  const {
    open,
    show,
    close,
    refresh,
    onTranslate,
    onSwitch,
    ...publicationViewer
  } = usePublicationViewer(pushToast)

  useEffect(
    () => show(_gid, _cid, _language, _version, _by),
    [_by, _cid, _gid, _language, _version, show]
  )

  const navigateTo = useCallback(
    (publication: PublicationOutput) => {
      navigate({
        pathname: generatePath(SHARE_PUBLICATION_PATH, {
          cid: Xid.fromValue(publication.cid).toString(),
        }),
        search: toURLSearchParams({
          gid:
            publication.status === PublicationStatus.Published
              ? undefined
              : Xid.fromValue(publication.gid).toString(),
          language: publication.language,
          version:
            publication.status === PublicationStatus.Published
              ? undefined
              : publication.version,
          by: _by,
        }).toString(),
      })
    },
    [_by, navigate]
  )

  const handleTranslate = useCallback(
    async (language: UILanguageItem, model: GPT_MODEL) => {
      const publication = await onTranslate(language, model)
      if (publication) navigateTo(publication)
    },
    [navigateTo, onTranslate]
  )

  const handleSwitch = useCallback(
    async (language: UILanguageItem, canTranslate: boolean) => {
      const publication = await onSwitch(language, canTranslate)
      if (publication) navigateTo(publication)
    },
    [navigateTo, onSwitch]
  )

  return {
    publicationViewer: {
      onTranslate: handleTranslate,
      onSwitch: handleSwitch,
      ...publicationViewer,
    },
  } as const
}
