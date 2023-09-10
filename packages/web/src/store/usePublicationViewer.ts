import { generatePublicationShareLink } from '#/shared'
import { type ToastAPI } from '@yiwen-ai/component'
import {
  PublicationJobStatus,
  RequestError,
  toMessage,
  useCreationCollectionList,
  useEnsureAuthorized,
  useFetcherConfig,
  useLanguageList,
  useLanguageProcessor,
  useMyGroupList,
  usePublication,
  usePublicationAPI,
  useTranslatedPublicationList,
  type Language,
  type UILanguageItem,
} from '@yiwen-ai/store'
import { isTruthy } from '@yiwen-ai/util'
import { uniq } from 'lodash-es'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import { Xid } from 'xid-ts'

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
    translate,
  } = useTranslatedPublicationList(_gid, _cid, originalLanguageCode, _version)

  const {
    refresh: refreshCollectionList,
    isAdded: _isFavorite,
    isAdding: _isAddingFavorite,
    isRemoving: _isRemovingFavorite,
    add: _addFavorite,
    remove: _removeFavorite,
  } = useCreationCollectionList(_cid)

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
      refreshCollectionList(),
    ])
    return publication
  }, [
    refreshCollectionList,
    refreshProcessingList,
    refreshPublication,
    refreshTranslatedList,
  ])

  useEffect(() => {
    open && refresh()
  }, [open, refresh])
  //#endregion

  //#region translate
  const [processingLanguage, setProcessingLanguage] = useState(
    undefined as Language | undefined
  )

  const processingControllerRef = useRef<AbortController | undefined>()

  const { defaultGroup, refreshDefaultGroup } = useMyGroupList()

  const onTranslate = useMemo(() => {
    return ensureAuthorized(async (lang: UILanguageItem) => {
      const language = lang.code
      const controller = new AbortController()
      processingControllerRef.current?.abort()
      processingControllerRef.current = controller
      try {
        setProcessingLanguage(lang)
        if (lang.isOriginal && _gid && _cid && _version != null) {
          // original publication may be archived, so we need to read it directly
          const { result } = await readPublication(
            {
              gid: _gid,
              cid: _cid,
              language,
              version: _version,
              fields: null,
            },
            controller.signal
          )
          return result
        }
        const gid = defaultGroup?.id ?? (await refreshDefaultGroup())?.id
        try {
          return await translate(gid, language, controller.signal)
        } catch (error) {
          if (
            error instanceof RequestError &&
            error.status === 409 &&
            gid &&
            _cid &&
            _version != null
          ) {
            // translation already exists, read it directly
            const { result } = await readPublication(
              {
                gid: Xid.fromValue(gid).toString(),
                cid: _cid,
                language,
                version: _version,
                fields: null,
              },
              controller.signal
            )
            return result
          }
          throw error
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          pushToast({
            type: 'warning',
            message: intl.formatMessage({ defaultMessage: '翻译失败' }),
            description: toMessage(error),
          })
        }
        return undefined
      } finally {
        if (!controller.signal.aborted) {
          setProcessingLanguage(undefined)
        }
      }
    })
  }, [
    _cid,
    _gid,
    _version,
    defaultGroup?.id,
    ensureAuthorized,
    intl,
    pushToast,
    readPublication,
    refreshDefaultGroup,
    translate,
  ])

  const onSwitch = useCallback(
    async (lang: UILanguageItem) => {
      const language = lang.code
      let publication = translatedList?.find(
        (item) => item.language === language && item.version === _version
      )
      if (!publication) {
        publication = translatedList
          ?.filter((item) => item.language === language)
          .sort((a, b) => b.version - a.version)[0] // latest version
      }
      if (!publication) {
        publication = await onTranslate(lang)
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
    [_version, onTranslate, show, translatedList]
  )

  const onProcessingDialogClose = useCallback(() => {
    setProcessingLanguage(undefined)
    processingControllerRef.current?.abort()
  }, [])
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
    processingLanguage,
    onTranslate: onSwitch,
    onProcessingDialogClose,
    shareLink,
    onShare,
    isFavorite,
    isAddingFavorite,
    isRemovingFavorite,
    onAddFavorite,
    onRemoveFavorite,
  } as const
}
