import { SEARCH_PATH } from '#/App'
import { type ToastAPI } from '@yiwen-ai/component'
import {
  PublicationStatus,
  type BookmarkOutput,
  type GPT_MODEL,
  type PublicationOutput,
  type UILanguageItem,
} from '@yiwen-ai/store'
import { toURLSearchParams } from '@yiwen-ai/util'
import { useCallback, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Xid } from 'xid-ts'
import { usePublicationViewer } from './usePublicationViewer'
import { useResponsiveTabSection } from './useResponsiveTabSection'

export function useHomePage(pushToast: ToastAPI['pushToast']) {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  //#region search
  const onSearch = useCallback(
    (keyword: string) => {
      keyword = keyword.trim()
      if (!keyword) return
      navigate({
        pathname: SEARCH_PATH,
        search: new URLSearchParams({ q: keyword }).toString(),
      })
    },
    [navigate]
  )
  //#endregion

  //#region publication viewer
  const {
    show: showPublicationViewer,
    close: closePublicationViewer,
    refresh: refreshPublicationViewer,
    onTranslate: onPublicationTranslate,
    onSwitch: onPublicationSwitch,
    onAddFavorite: onPublicationAddFavorite,
    onRemoveFavorite: onPublicationRemoveFavorite,
    ...publicationViewer
  } = usePublicationViewer(pushToast)

  const navigateTo = useCallback(
    (item: PublicationOutput | BookmarkOutput) => {
      const status = (item as PublicationOutput).status as
        | PublicationStatus
        | undefined
      setSearchParams(
        toURLSearchParams({
          gid:
            status === PublicationStatus.Published
              ? undefined
              : Xid.fromValue(item.gid).toString(),
          cid: Xid.fromValue(item.cid).toString(),
          language: item.language,
          version:
            status === PublicationStatus.Published
              ? undefined
              : item.version.toString(),
        })
      )
    },
    [setSearchParams]
  )

  const onView = useCallback(
    (item: PublicationOutput | BookmarkOutput) => {
      showPublicationViewer(item.gid, item.cid, item.language, item.version)
      navigateTo(item)
    },
    [navigateTo, showPublicationViewer]
  )

  const handlePublicationTranslate = useCallback(
    async (language: UILanguageItem, model: GPT_MODEL) => {
      const publication = await onPublicationTranslate(language, model)
      if (publication) navigateTo(publication)
    },
    [navigateTo, onPublicationTranslate]
  )

  const handlePublicationSwitch = useCallback(
    async (language: UILanguageItem, canTranslate: boolean) => {
      const publication = await onPublicationSwitch(language, canTranslate)
      if (publication) navigateTo(publication)
    },
    [navigateTo, onPublicationSwitch]
  )

  const handlePublicationViewerClose = useCallback(() => {
    closePublicationViewer()
    setSearchParams({})
  }, [closePublicationViewer, setSearchParams])

  const _gid = searchParams.get('gid')
  const _cid = searchParams.get('cid')
  const _language = searchParams.get('language')
  const _version = searchParams.get('version')
  const _by = searchParams.get('by')

  useEffect(() => {
    if (_cid) {
      showPublicationViewer(_gid, _cid, _language, _version, _by)
    } else {
      closePublicationViewer()
    }
  }, [
    _by,
    _cid,
    _gid,
    _language,
    _version,
    closePublicationViewer,
    showPublicationViewer,
  ])
  //#endregion

  const {
    refreshFollowedPublicationList,
    refreshRecommendedPublicationList,
    refreshBookmarkList,
    ...responsiveTabSection
  } = useResponsiveTabSection()

  const handlePublicationAddFavorite = useCallback(async () => {
    await onPublicationAddFavorite()
    refreshBookmarkList()
  }, [onPublicationAddFavorite, refreshBookmarkList])

  const handlePublicationRemoveFavorite = useCallback(async () => {
    await onPublicationRemoveFavorite()
    refreshBookmarkList()
  }, [onPublicationRemoveFavorite, refreshBookmarkList])

  return {
    onSearch,
    publicationViewer: {
      close: handlePublicationViewerClose,
      onTranslate: handlePublicationTranslate,
      onSwitch: handlePublicationSwitch,
      onAddFavorite: handlePublicationAddFavorite,
      onRemoveFavorite: handlePublicationRemoveFavorite,
      ...publicationViewer,
    },
    responsiveTabSection: {
      onView,
      ...responsiveTabSection,
    },
  } as const
}
