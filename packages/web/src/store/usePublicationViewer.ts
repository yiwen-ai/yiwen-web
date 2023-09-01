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
import { uniq } from 'lodash-es'
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
  const { defaultGroup: { id: defaultGroupId } = {}, refreshDefaultGroup } =
    useMyGroupList()

  const refresh = useCallback(async () => {
    const [publication] = await Promise.all([
      refreshPublication(),
      refreshTranslatedPublicationList(),
      refreshCollectionList(),
      refreshDefaultGroup(),
    ])
    return publication
  }, [
    refreshCollectionList,
    refreshDefaultGroup,
    refreshPublication,
    refreshTranslatedPublicationList,
  ])
  //#endregion

  //#region language
  const translatedLanguageCodeList = useMemo(() => {
    if (!translatedPublicationList) return undefined
    return uniq(
      translatedPublicationList.map((publication) => publication.language)
    )
  }, [translatedPublicationList])

  const {
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

  const translate = useTranslatePublication(
    _gid,
    _cid,
    publication?.from_language,
    _version
  )

  const onTranslate = useCallback(
    async (language: string) => {
      const version = Number(_version)
      let publication = translatedPublicationList?.find(
        (item) => item.language === language && item.version === version
      )
      if (!publication) {
        publication = translatedPublicationList
          ?.filter((item) => item.language === language)
          .sort((a, b) => b.version - a.version)[0] // latest version
      }
      if (!publication) {
        try {
          setTranslatingLanguage(
            languageList?.find(({ code }) => code === language)
          )
          publication = await translate(defaultGroupId, language)
          refreshTranslatedPublicationList().catch(() => {
            // ignore
          })
        } catch (error) {
          pushToast({
            type: 'warning',
            message: intl.formatMessage({ defaultMessage: '翻译失败' }),
            description: toMessage(error),
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
      intl,
      languageList,
      pushToast,
      refreshTranslatedPublicationList,
      translate,
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

  const onShare = useCallback(async () => {
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

  const onAddFavorite = useCallback(
    () => publication && _addFavorite(publication),
    [_addFavorite, publication]
  )

  const onRemoveFavorite = useCallback(
    () => publication && _removeFavorite(publication),
    [_removeFavorite, publication]
  )
  //#endregion

  return {
    isLoading,
    error,
    publication,
    refresh,
    currentLanguage,
    originalLanguage,
    translatedLanguageList,
    pendingLanguageList,
    translatingLanguage,
    onTranslate,
    shareLink,
    onShare,
    isFavorite,
    isAddingFavorite,
    isRemovingFavorite,
    onAddFavorite,
    onRemoveFavorite,
  } as const
}
