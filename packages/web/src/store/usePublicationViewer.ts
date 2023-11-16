import { generatePublicationShareLink } from '#/shared'
import { type ToastAPI } from '@yiwen-ai/component'
import {
  PublicationJobStatus,
  PublicationStatus,
  RequestError,
  setXLanguage,
  toMessage,
  useAuth,
  useCollectionChildren,
  useEnsureAuthorized,
  useFetcherConfig,
  useLanguageList,
  useLanguageProcessor,
  usePublication,
  usePublicationAPI,
  usePublicationBookmarkList,
  useTranslatedPublicationList,
  useWechat,
  type GPT_MODEL,
  type UILanguageItem,
} from '@yiwen-ai/store'
import { isTruthy } from '@yiwen-ai/util'
import { uniq } from 'lodash-es'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import { Xid } from 'xid-ts'
import { useChargeDialog } from './useChargeDialog'
import {
  useTranslateConfirmDialog,
  useTranslateDialog,
} from './useTranslateConfirmDialog'

interface Params {
  open: boolean
  _gid: string | undefined
  _cid: string | undefined
  _parent: string | undefined
  _language: string | undefined
  _version: number | undefined
  _by: string | undefined
}

export function usePublicationViewer(pushToast: ToastAPI['pushToast']) {
  const intl = useIntl()
  const ensureAuthorized = useEnsureAuthorized()
  const { readPublication } = usePublicationAPI()
  const { wechat } = useWechat()

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
    _parent: undefined,
    _language: undefined,
    _version: undefined,
    _by: undefined,
  })

  //#region fetch
  const { isLoading, error, publication } = usePublication(
    params._gid,
    params._cid,
    params._language,
    params._version
  )

  const { _gid, _cid, _language, _version, _fromLanguage } = useMemo(() => {
    return {
      _gid: publication?.gid
        ? Xid.fromValue(publication.gid).toString()
        : params._gid,
      _cid: publication?.cid
        ? Xid.fromValue(publication.cid).toString()
        : params._cid,
      _language: publication?.language ?? params._language,
      _version: publication?.version ?? params._version,
      _fromLanguage: publication?.from_language,
    }
  }, [
    params._cid,
    params._gid,
    params._language,
    params._version,
    publication?.cid,
    publication?.from_language,
    publication?.gid,
    publication?.language,
    publication?.version,
  ])

  const {
    translatedList,
    processingList,
    refreshTranslatedList,
    refreshProcessingList,
  } = useTranslatedPublicationList(_gid, _cid, _fromLanguage, _version)

  const {
    show: showTranslateConfirmDialog,
    close: closeTranslateConfirmDialog,
    refresh: refreshTranslateConfirmDialog,
    ...translateConfirmDialog
  } = useTranslateConfirmDialog(_gid, _cid, _fromLanguage, _version)

  const {
    show: showTranslateDialog,
    close: closeTranslateDialog,
    translate,
    ...translateDialog
  } = useTranslateDialog(pushToast, _gid, _cid, _fromLanguage, _version)

  const {
    refresh: refreshBookmarkList,
    isAdded: _isFavorite,
    isAdding: _isAddingFavorite,
    isRemoving: _isRemovingFavorite,
    add: _addFavorite,
    remove: _removeFavorite,
  } = usePublicationBookmarkList(_cid)

  const { languageList } = useLanguageList()

  const translatedLanguageCodeList = useMemo(() => {
    if (!translatedList) return undefined
    return translatedList.map(
      (item) => [item.language, item.version] as [string, number]
    )
  }, [translatedList])

  const processingLanguageCodeList = useMemo(() => {
    if (!_cid || !processingList) return undefined
    const cid = Xid.fromValue(_cid)
    return uniq(
      processingList
        .filter((item) => item.status === PublicationJobStatus.Processing)
        .map((item) => item.publication)
        .filter(isTruthy)
        .filter((item) => cid.equals(Xid.fromValue(item.cid)))
        .map((item) => item.language)
    )
  }, [_cid, processingList])

  const {
    originalLanguage,
    currentLanguage,
    translatedLanguageList,
    pendingLanguageList,
  } = useLanguageProcessor(
    languageList,
    _fromLanguage, // original language
    _language, // current language
    translatedLanguageCodeList,
    processingLanguageCodeList
  )

  const show = useCallback(
    (
      _gid: Uint8Array | string | null | undefined,
      _cid: Uint8Array | string | null | undefined,
      _language: string | null | undefined,
      _version: number | string | null | undefined,
      _parent?: Uint8Array | string | null | undefined,
      _by?: string | null | undefined
    ) => {
      setParams((params) => {
        const gid = _gid ? Xid.fromValue(_gid).toString() : undefined
        const cid = _cid ? Xid.fromValue(_cid).toString() : undefined
        const parent = _parent ? Xid.fromValue(_parent).toString() : undefined
        const language = _language ? _language : undefined
        const version = _version != null ? Number(_version) : undefined
        const by = _by || params._by

        if (
          params.open &&
          (params._gid === gid || gid == null) &&
          params._cid === cid &&
          (params._language === language || language == null) &&
          (params._version === version || version == null) &&
          (params._by === by || by == null)
        ) {
          return params
        }

        return {
          open: true,
          _gid: gid,
          _cid: cid,
          _language: language,
          _version: version,
          _by: by,
          _parent: parent,
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
      _version: undefined,
      _by: undefined,
      _parent: undefined,
    })
  }, [])

  const {
    isLoading: isMenuLoading,
    isValidating: isMenuLoadingMore,
    hasMore: menuHasMore,
    loadMore: menuLoadMore,
    items: collectionMenu,
  } = useCollectionChildren(_gid, params._parent)

  const refresh = useCallback(async () => {
    const [publication] = await Promise.all([
      refreshTranslatedList(),
      refreshProcessingList(),
      refreshBookmarkList(),
    ])
    return publication
  }, [refreshBookmarkList, refreshProcessingList, refreshTranslatedList])
  //#endregion

  //#region translate
  const processingControllerRef = useRef<AbortController | undefined>()
  useEffect(() => () => processingControllerRef.current?.abort(), [])

  const handleCharge = useCallback(async () => {
    const result = await onCharge()
    if (result) refreshTranslateConfirmDialog()
  }, [onCharge, refreshTranslateConfirmDialog])

  const onTranslate = useCallback(
    async (language: UILanguageItem, model: GPT_MODEL) => {
      closeTranslateConfirmDialog()
      const publication = await translate(language, model)
      if (publication) {
        show(
          publication.gid,
          publication.cid,
          publication.language,
          publication.version
        )
      }
      return publication
    },
    [closeTranslateConfirmDialog, show, translate]
  )

  const onSwitch = useCallback(
    async (language: UILanguageItem, canTranslate: boolean) => {
      const _language = language.code
      let publication = translatedList?.find(
        (item) => item.language === _language
      )

      if (
        !publication &&
        language.isOriginal &&
        _gid &&
        _cid &&
        _version != null
      ) {
        const controller = new AbortController()
        processingControllerRef.current?.abort()
        processingControllerRef.current = controller
        try {
          // original publication may be archived, so we need to read it directly
          const { result } = await readPublication(
            {
              gid: _gid,
              cid: _cid,
              language: _language,
              version: _version,
              fields: null,
            },
            controller.signal
          )
          publication = result
        } catch (error) {
          if (!controller.signal.aborted) {
            if (error instanceof RequestError && error.status === 403) {
              pushToast({
                type: 'warning',
                message: intl.formatMessage({ defaultMessage: '无权限查看' }),
                description: toMessage(error),
              })
            } else if (error instanceof RequestError && error.status === 404) {
              pushToast({
                type: 'warning',
                message: intl.formatMessage({ defaultMessage: '原文不存在' }),
                description: toMessage(error),
              })
            } else {
              pushToast({
                type: 'warning',
                message: intl.formatMessage({ defaultMessage: '读取原文失败' }),
                description: toMessage(error),
              })
            }
          }
        }
      } else if (!publication || canTranslate) {
        showTranslateConfirmDialog(language)
      } else if (publication) {
        setXLanguage(publication.language)
        show(
          publication.gid,
          publication.cid,
          publication.language,
          publication.version
        )
      }
      return publication
    },
    [
      _cid,
      _gid,
      _version,
      intl,
      pushToast,
      readPublication,
      show,
      showTranslateConfirmDialog,
      translatedList,
    ]
  )
  //#endregion

  //#region share
  const SHARE_URL = useFetcherConfig().SHARE_URL
  const { user } = useAuth()

  const shareLink = useMemo(() => {
    if (!_cid) return undefined
    if (publication?.status !== PublicationStatus.Published) return undefined
    return generatePublicationShareLink(
      SHARE_URL,
      null,
      _cid,
      _language,
      null,
      user?.cn ?? params._by
    )
  }, [SHARE_URL, _cid, _language, params._by, publication?.status, user?.cn])

  useEffect(() => {
    const link = document.location.href.split('#')[0] as string
    const title = publication?.title || document.title
    const imgUrl = publication?.cover || 'https://cdn.yiwen.pub/yiwen.jpg'
    let desc = publication?.summary || link
    if (desc.length > 100) {
      desc = desc.substring(0, 100) + '...'
    }
    wechat({
      title,
      link,
      imgUrl,
      desc,
    })
  }, [publication, wechat])

  const onShare = useCallback(async () => {
    try {
      if (!shareLink) {
        throw new Error(
          'creation id and language are required to generate share link'
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

  const onAddFavorite = useMemo(
    () => ensureAuthorized(() => publication && _addFavorite(publication)),
    [_addFavorite, ensureAuthorized, publication]
  )

  const onRemoveFavorite = useCallback(
    () => publication && _removeFavorite(publication),
    [_removeFavorite, publication]
  )
  //#endregion

  return {
    translateConfirmDialog: {
      onClose: closeTranslateConfirmDialog,
      ...translateConfirmDialog,
    },
    translateDialog: {
      onClose: closeTranslateDialog,
      ...translateDialog,
    },
    chargeDialog: {
      onClose: closeChargeDialog,
      onCharge: handleCharge,
      ...chargeDialog,
    },
    isLoading,
    error,
    publication,
    collectionMenu,
    hasMore: menuHasMore,
    isLoadingMore: isMenuLoading || isMenuLoadingMore,
    loadMore: menuLoadMore,
    open,
    show,
    close,
    refresh,
    currentLanguage,
    originalLanguage,
    translatedLanguageList,
    pendingLanguageList,
    onCharge: showChargeDialog,
    onTranslate,
    onSwitch,
    shareLink,
    onShare,
    isFavorite,
    isAddingFavorite,
    isRemovingFavorite,
    onAddFavorite,
    onRemoveFavorite,
  } as const
}
