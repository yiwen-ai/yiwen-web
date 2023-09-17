import { generatePublicationShareLink } from '#/shared'
import { type ToastAPI } from '@yiwen-ai/component'
import {
  PublicationJobStatus,
  RequestError,
  toMessage,
  useCreationBookmarkList,
  useEnsureAuthorized,
  useFetcherConfig,
  useLanguageList,
  useLanguageProcessor,
  usePublication,
  usePublicationAPI,
  useTranslatedPublicationList,
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
  _gid: string | null | undefined
  _cid: string | null | undefined
  _language: string | null | undefined
  _version: number | null | undefined
}

export function usePublicationViewer(pushToast: ToastAPI['pushToast']) {
  const intl = useIntl()
  const ensureAuthorized = useEnsureAuthorized()
  const { readPublication } = usePublicationAPI()

  const {
    show: showChargeDialog,
    close: closeChargeDialog,
    onCharge,
    ...chargeDialog
  } = useChargeDialog(pushToast)

  const [{ open, _gid, _cid, _language, _version }, setParams] =
    useState<Params>({
      open: false,
      _gid: undefined,
      _cid: undefined,
      _language: undefined,
      _version: undefined,
    })

  //#region fetch
  const {
    isLoading,
    error,
    publication,
    refresh: refreshPublication,
  } = usePublication(_gid, _cid, _language, _version)
  const originalLanguageCode = publication?.from_language

  const {
    translatedList,
    processingList,
    refreshTranslatedList,
    refreshProcessingList,
  } = useTranslatedPublicationList(_gid, _cid, originalLanguageCode, _version)

  const {
    show: showTranslateConfirmDialog,
    close: closeTranslateConfirmDialog,
    refresh: refreshTranslateConfirmDialog,
    ...translateConfirmDialog
  } = useTranslateConfirmDialog(_gid, _cid, originalLanguageCode, _version)

  const {
    show: showTranslateDialog,
    close: closeTranslateDialog,
    translate,
    ...translateDialog
  } = useTranslateDialog(pushToast, _gid, _cid, originalLanguageCode, _version)

  const {
    refresh: refreshBookmarkList,
    isAdded: _isFavorite,
    isAdding: _isAddingFavorite,
    isRemoving: _isRemovingFavorite,
    add: _addFavorite,
    remove: _removeFavorite,
  } = useCreationBookmarkList(_cid)

  const { languageList } = useLanguageList()

  const translatedLanguageCodeList = useMemo(() => {
    if (!translatedList) return undefined
    return uniq(translatedList.map((item) => item.language))
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
    originalLanguageCode, // original language
    _language, // current language
    translatedLanguageCodeList,
    processingLanguageCodeList
  )

  const show = useCallback(
    (
      _gid: Uint8Array | string | null | undefined,
      _cid: Uint8Array | string | null | undefined,
      _language: string | null | undefined,
      _version: number | string | null | undefined
    ) => {
      setParams({
        open: true,
        _gid: _gid != null ? Xid.fromValue(_gid).toString() : undefined,
        _cid: _cid != null ? Xid.fromValue(_cid).toString() : undefined,
        _language,
        _version: _version != null ? Number(_version) : undefined,
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
    })
  }, [])

  const refresh = useCallback(async () => {
    const [publication] = await Promise.all([
      refreshPublication(),
      refreshTranslatedList(),
      refreshProcessingList(),
      refreshBookmarkList(),
    ])
    return publication
  }, [
    refreshBookmarkList,
    refreshProcessingList,
    refreshPublication,
    refreshTranslatedList,
  ])

  useEffect(() => {
    open && refresh()
  }, [open, refresh])
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
    [closeTranslateConfirmDialog, translate, show]
  )

  const onSwitch = useCallback(
    async (language: UILanguageItem) => {
      const _language = language.code
      let publication = translatedList?.find(
        (item) => item.language === _language && item.version === _version
      )
      if (!publication) {
        publication = translatedList
          ?.filter((item) => item.language === _language)
          .sort((a, b) => b.version - a.version)[0] // latest version
      }
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
      } else if (!publication) {
        showTranslateConfirmDialog(language)
      }
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

  const shareLink = useMemo(() => {
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
