import { type ToastAPI } from '@yiwen-ai/component'
import { toMessage } from '@yiwen-ai/store'
import { useCallback, useEffect } from 'react'
import { useIntl } from 'react-intl'
import { usePublicationViewer } from './usePublicationViewer'

export function useSharePublication(
  pushToast: ToastAPI['pushToast'],
  _gid: string | null | undefined,
  _cid: string | null | undefined,
  _language: string | null | undefined,
  _version: number | string | null | undefined
) {
  const intl = useIntl()

  const {
    refresh,
    translate: _translate,
    addFavorite: onAddFavorite,
    removeFavorite: onRemoveFavorite,
    ...publicationViewer
  } = usePublicationViewer(pushToast, _gid, _cid, _language, _version)

  useEffect(() => {
    refresh().catch(() => {})
  }, [refresh])

  const translate = useCallback(
    async (language: string) => {
      try {
        return await _translate(language)
      } catch (error) {
        pushToast({
          type: 'warning',
          message: intl.formatMessage({ defaultMessage: '翻译失败' }),
          description: toMessage(error),
        })
        throw error
      }
    },
    [_translate, intl, pushToast]
  )

  return {
    ...publicationViewer,
    translate,
    onAddFavorite,
    onRemoveFavorite,
  }
}
