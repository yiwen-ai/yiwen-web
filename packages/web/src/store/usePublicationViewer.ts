import { generatePublicationShareLink } from '#/shared'
import { type ToastAPI } from '@yiwen-ai/component'
import {
  toMessage,
  useCreationCollectionList,
  useFetcherConfig,
  useLanguageList,
  useLanguageProcessor,
  useMyGroupList,
  usePublication,
  useTranslatePublication,
  useTranslatedPublicationList,
  type Language,
} from '@yiwen-ai/store'
import { useCallback, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'

export function usePublicationViewer(
  pushToast: ToastAPI['pushToast'],
  _gid: string | null | undefined,
  _cid: string | null | undefined,
  _language: string | null | undefined,
  _version: number | string | null | undefined
) {
  const intl = useIntl()

  //#region fetch
  const {
    publication,
    error,
    isLoading,
    refresh: refreshPublication,
  } = usePublication(_gid, _cid, _language, _version)
  const {
    publicationList: translatedPublicationList,
    refresh: refreshTranslatedPublicationList,
  } = useTranslatedPublicationList(_gid, _cid)
  const {
    refresh: refreshCollectionList,
    isAdded: _isFavorite,
    isAdding: _isAddingFavorite,
    isRemoving: _isRemovingFavorite,
    add: _addFavorite,
    remove: _removeFavorite,
  } = useCreationCollectionList(_cid)
  const { languageList } = useLanguageList()
  const defaultGroupId = useMyGroupList().defaultGroup?.id

  const refresh = useCallback(async () => {
    const [publication] = await Promise.all([
      refreshPublication(),
      refreshTranslatedPublicationList(),
      refreshCollectionList(),
    ])
    return publication
  }, [
    refreshCollectionList,
    refreshPublication,
    refreshTranslatedPublicationList,
  ])
  //#endregion

  //#region language
  const translatedLanguageCodeList = useMemo(() => {
    return translatedPublicationList
      ?.filter((publication) => publication.version === _version)
      .map((publication) => publication.language)
  }, [_version, translatedPublicationList])

  const {
    preferredLanguage,
    currentLanguage,
    originalLanguage,
    translatedLanguageList,
    pendingLanguageList,
  } = useLanguageProcessor(
    languageList,
    _language,
    publication?.from_language,
    translatedLanguageCodeList
  )
  //#endregion

  //#region translate
  const [translatingLanguage, setTranslatingLanguage] = useState(
    undefined as Language | undefined
  )

  const _translate = useTranslatePublication(
    _gid,
    _cid,
    publication?.from_language,
    _version
  )

  const translate = useCallback(
    async (language: string) => {
      let publication = translatedPublicationList?.find((publication) => {
        return (
          publication.language === language && publication.version === _version
        )
      })
      if (!publication) {
        try {
          setTranslatingLanguage(
            languageList?.find(({ code }) => code === language)
          )
          publication = await _translate(defaultGroupId, language)
          refreshTranslatedPublicationList().catch(() => {
            // ignore
          })
        } finally {
          setTranslatingLanguage(undefined)
        }
      }
      return publication
    },
    [
      _version,
      defaultGroupId,
      languageList,
      refreshTranslatedPublicationList,
      _translate,
      translatedPublicationList,
    ]
  )
  //#endregion

  //#region share
  const SHARE_URL = useFetcherConfig()?.SHARE_URL

  const shareLink = useMemo(() => {
    if (!SHARE_URL) throw new Error('missing SHARE_URL in config')
    if (!_gid || !_cid || !_language || _version == null) return undefined
    return generatePublicationShareLink(
      SHARE_URL,
      _gid,
      _cid,
      _language,
      _version
    )
  }, [SHARE_URL, _cid, _gid, _language, _version])

  const copyShareLink = useCallback(async () => {
    try {
      if (!shareLink) {
        throw new Error(
          'group id, creation id, language and version are required to generate share link'
        )
      }
      await navigator.clipboard.writeText(shareLink)
      pushToast({
        type: 'success',
        message: intl.formatMessage({ defaultMessage: '链接已复制' }),
        description: shareLink,
      })
    } catch (error) {
      pushToast({
        type: 'warning',
        message: intl.formatMessage({ defaultMessage: '分享失败' }),
        description: toMessage(error),
      })
    }
  }, [intl, pushToast, shareLink])
  //#endregion

  //#region favorite
  const isFavorite = useMemo(
    () => !!publication && _isFavorite(publication),
    [_isFavorite, publication]
  )

  const isAddingFavorite = useMemo(
    () => !!publication && _isAddingFavorite(publication),
    [_isAddingFavorite, publication]
  )

  const isRemovingFavorite = useMemo(
    () => !!publication && _isRemovingFavorite(publication),
    [_isRemovingFavorite, publication]
  )

  const addFavorite = useCallback(async () => {
    if (publication) await _addFavorite(publication)
  }, [_addFavorite, publication])

  const removeFavorite = useCallback(async () => {
    if (publication) await _removeFavorite(publication)
  }, [_removeFavorite, publication])
  //#endregion

  return {
    isLoading,
    error,
    publication,
    refresh,
    preferredLanguage,
    currentLanguage,
    originalLanguage,
    translatedLanguageList,
    pendingLanguageList,
    translatingLanguage,
    translate,
    shareLink,
    copyShareLink,
    isFavorite,
    isAddingFavorite,
    isRemovingFavorite,
    addFavorite,
    removeFavorite,
  } as const
}
