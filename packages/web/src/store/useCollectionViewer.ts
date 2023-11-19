import { generateCollectionShareLink } from '#/shared'
import { type ToastAPI } from '@yiwen-ai/component'
import {
  CollectionStatus,
  getCollectionInfo,
  setXLanguage,
  toMessage,
  useAuth,
  useCollection,
  useCollectionBookmarkList,
  useEnsureAuthorized,
  useFetcherConfig,
  useLanguageList,
  useLanguageProcessor,
  useWechat,
  type UILanguageItem,
} from '@yiwen-ai/store'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import { Xid } from 'xid-ts'
import { useChargeDialog } from './useChargeDialog'

interface Params {
  open: boolean
  _gid: string | undefined
  _cid: string | undefined
  _language: string | undefined
  _by: string | undefined
}

export function useCollectionViewer(pushToast: ToastAPI['pushToast']) {
  const intl = useIntl()
  const ensureAuthorized = useEnsureAuthorized()
  const { wechat } = useWechat()
  const { languageList } = useLanguageList()

  const {
    show: showChargeDialog,
    close: closeChargeDialog,
    onCharge,
    ...chargeDialog
  } = useChargeDialog(pushToast)

  const [{ open, ...params }, setParams] = useState<Params>({
    open: false,
    _gid: undefined,
    _cid: undefined,
    _language: undefined,
    _by: undefined,
  })

  //#region fetch
  const {
    isLoading,
    error,
    collection,
    refresh: refreshCollection,
  } = useCollection(params._gid, params._cid, params._language)

  const {
    isAdded: _isFavorite,
    isAdding: _isAddingFavorite,
    isRemoving: _isRemovingFavorite,
    add: _addFavorite,
    remove: _removeFavorite,
    refresh: refreshBookmarkList,
  } = useCollectionBookmarkList(params._cid)

  const language = useMemo(() => {
    if (!collection) return undefined
    const [lang, _] = getCollectionInfo(collection)
    return lang
  }, [collection])

  const translatedLanguageCodeList = useMemo(() => {
    if (!collection || !collection.language) return undefined
    const languages = [collection.language, ...(collection.languages || [])]
    return languages.map(
      (item) => [item, collection.version] as [string, number]
    )
  }, [collection])

  const {
    originalLanguage,
    currentLanguage,
    translatedLanguageList,
    pendingLanguageList,
  } = useLanguageProcessor(
    languageList,
    collection?.language, // original language
    language, // current language
    translatedLanguageCodeList,
    undefined
  )

  const show = useCallback(
    (
      _gid: Uint8Array | string | null | undefined,
      _cid: Uint8Array | string | null | undefined,
      _language: string | undefined,
      _by?: string | null | undefined
    ) => {
      setParams((params) => {
        const gid = _gid ? Xid.fromValue(_gid).toString() : undefined
        const cid = _cid ? Xid.fromValue(_cid).toString() : undefined
        const by = _by || params._by
        if (
          params.open &&
          (params._gid === gid || gid == null) &&
          params._cid === cid &&
          (params._language === _language || _language == null) &&
          (params._by === by || by == null)
        ) {
          return params
        }

        return {
          open: true,
          _gid: gid,
          _cid: cid,
          _language,
          _by: by,
        }
      })
    },
    []
  )

  const close = useCallback(() => {
    setParams({
      open: false,
      _gid: undefined,
      _cid: undefined,
      _language: undefined,
      _by: undefined,
    })
  }, [])

  const refresh = useCallback(async () => {
    const [collection] = await Promise.all([
      refreshCollection(),
      refreshBookmarkList(),
    ])
    return collection
  }, [refreshCollection, refreshBookmarkList])

  //#endregion

  //#region share
  const SHARE_URL = useFetcherConfig().SHARE_URL
  const { user } = useAuth()

  const shareLink = useMemo(() => {
    if (!params._cid) return undefined
    if (collection?.status !== CollectionStatus.Public) return undefined
    return generateCollectionShareLink(
      SHARE_URL,
      null,
      params._cid,
      user?.cn ?? params._by
    )
  }, [SHARE_URL, params._cid, params._by, collection?.status, user?.cn])

  useEffect(() => {
    if (!collection) return
    const [_, info] = getCollectionInfo(collection)
    if (!info) return
    const link = document.location.href.split('#')[0] as string
    const title = info.title || document.title
    const imgUrl = collection?.cover || 'https://cdn.yiwen.pub/yiwen.ai.jpg'
    let desc = info.summary || link
    if (desc.length > 100) {
      desc = desc.substring(0, 100) + '...'
    }
    wechat({
      title,
      link,
      imgUrl,
      desc,
    })
  }, [collection, wechat])

  const onShare = useCallback(async () => {
    try {
      if (!shareLink) {
        throw new Error(
          'collection id and language are required to generate share link'
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
    () => !!collection && _isFavorite(collection),
    [_isFavorite, collection]
  )

  const isAddingFavorite = useMemo(
    () => !!collection && _isAddingFavorite(collection),
    [_isAddingFavorite, collection]
  )

  const isRemovingFavorite = useMemo(
    () => !!collection && _isRemovingFavorite(collection),
    [_isRemovingFavorite, collection]
  )

  const onAddFavorite = useMemo(
    () => ensureAuthorized(() => collection && _addFavorite(collection)),
    [_addFavorite, ensureAuthorized, collection]
  )

  const onRemoveFavorite = useCallback(
    () => collection && _removeFavorite(collection),
    [_removeFavorite, collection]
  )

  const onSwitch = useCallback(
    async (lang: UILanguageItem) => {
      if (params._gid && params._cid && language != lang.code) {
        setXLanguage(lang.code)
        show(params._gid, params._cid, lang.code)
      }
    },
    [params._cid, params._gid, language, show]
  )

  return {
    chargeDialog: {
      onClose: closeChargeDialog,
      onCharge,
      ...chargeDialog,
    },
    isLoading,
    error,
    collection,
    open,
    show,
    close,
    refresh,
    refreshCollection,
    currentLanguage,
    originalLanguage,
    translatedLanguageList,
    pendingLanguageList,
    shareLink,
    onShare,
    onSwitch,
    onCharge: showChargeDialog,
    isFavorite,
    isAddingFavorite,
    isRemovingFavorite,
    onAddFavorite,
    onRemoveFavorite,
  } as const
}
