import { GROUP_DETAIL_PATH, SEARCH_PATH } from '#/App'
import { type ToastAPI } from '@yiwen-ai/component'
import { ObjectKind, isInWechat, type ObjectParams } from '@yiwen-ai/store'
import { useCallback } from 'react'
import { generatePath, useNavigate } from 'react-router-dom'
import { Xid } from 'xid-ts'
import { useCollectionViewer } from './useCollectionViewer'
import { usePublicationViewer } from './usePublicationViewer'
import { useResponsiveTabSection } from './useResponsiveTabSection'

export function useHomePage(pushToast: ToastAPI['pushToast']) {
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
    show: showCollectionViewer,
    refresh: refreshCollectionViewer,
    onAddFavorite: onCollectionAddFavorite,
    onRemoveFavorite: onCollectionRemoveFavorite,
    ...collectionViewer
  } = useCollectionViewer(pushToast)

  const {
    show: showPublicationViewer,
    refresh: refreshPublicationViewer,
    onAddFavorite: onPublicationAddFavorite,
    onRemoveFavorite: onPublicationRemoveFavorite,
    ...publicationViewer
  } = usePublicationViewer(pushToast)

  const onView = useCallback(
    (item: ObjectParams) => {
      if (item.kind === ObjectKind.Collection) {
        isInWechat()
          ? navigate({
              pathname: generatePath(GROUP_DETAIL_PATH, {
                gid: Xid.fromValue(item.gid as Uint8Array).toString(),
                type: 'collection',
              }),
              search: new URLSearchParams({
                cid: Xid.fromValue(item.cid).toString(),
              }).toString(),
            })
          : showCollectionViewer(item.gid, item.cid, item.language)
      } else {
        isInWechat()
          ? navigate({
              pathname: generatePath(GROUP_DETAIL_PATH, {
                gid: Xid.fromValue(item.gid as Uint8Array).toString(),
                type: 'publication',
              }),
              search: new URLSearchParams({
                cid: Xid.fromValue(item.cid).toString(),
                language: item.language as string,
                version: String(item.version),
              }).toString(),
            })
          : showPublicationViewer(
              item.gid,
              item.cid,
              item.language,
              item.version
            )
      }
    },
    [showPublicationViewer, showCollectionViewer, navigate]
  )

  const {
    refreshFollowedPublicationList,
    refreshRecommendedPublicationList,
    refreshBookmarkList,
    ...responsiveTabSection
  } = useResponsiveTabSection()

  const handleCollectionAddFavorite = useCallback(async () => {
    await onCollectionAddFavorite()
    refreshBookmarkList()
  }, [onCollectionAddFavorite, refreshBookmarkList])

  const handleCollectionRemoveFavorite = useCallback(async () => {
    await onCollectionRemoveFavorite()
    refreshBookmarkList()
  }, [onCollectionRemoveFavorite, refreshBookmarkList])

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
    showCollectionViewer,
    collectionViewer: {
      onAddFavorite: handleCollectionAddFavorite,
      onRemoveFavorite: handleCollectionRemoveFavorite,
      ...collectionViewer,
    },
    publicationViewer: {
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
