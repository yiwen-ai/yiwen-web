import { SEARCH_PATH } from '#/App'
import { type ToastAPI } from '@yiwen-ai/component'
import {
  useBookmarkList,
  useFollowedPublicationList,
  useRecommendedPublicationList,
  type BookmarkOutput,
  type PublicationOutput,
} from '@yiwen-ai/store'
import { useCallback, useEffect, useMemo } from 'react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'
import { usePublicationViewer } from './usePublicationViewer'

export function useHomePage(pushToast: ToastAPI['pushToast']) {
  const intl = useIntl()
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
    refresh: refreshPublicationViewer,
    onAddFavorite: onPublicationAddFavorite,
    onRemoveFavorite: onPublicationRemoveFavorite,
    ...publicationViewer
  } = usePublicationViewer(pushToast)

  const onView = useCallback(
    (item: PublicationOutput | BookmarkOutput) => {
      showPublicationViewer(item.gid, item.cid, item.language, item.version)
    },
    [showPublicationViewer]
  )
  //#endregion

  //#region following list
  const {
    isLoading: isLoadingFollowedPublicationList,
    items: followedPublicationList,
    refresh: refreshFollowedPublicationList,
  } = useFollowedPublicationList()

  const {
    isLoading: isLoadingRecommendedPublicationList,
    publicationList: recommendedPublicationList,
    refresh: refreshRecommendedPublicationList,
  } = useRecommendedPublicationList()

  useEffect(() => {
    refreshFollowedPublicationList()
    refreshRecommendedPublicationList()
  }, [refreshFollowedPublicationList, refreshRecommendedPublicationList])

  const followingList = useMemo(
    () => ({
      title: followedPublicationList.length
        ? intl.formatMessage({ defaultMessage: '关注' })
        : intl.formatMessage({ defaultMessage: '推荐' }),
      isLoading:
        isLoadingFollowedPublicationList || isLoadingRecommendedPublicationList,
      items: followedPublicationList.length
        ? followedPublicationList
        : recommendedPublicationList ?? [],
    }),
    [
      followedPublicationList,
      intl,
      isLoadingFollowedPublicationList,
      isLoadingRecommendedPublicationList,
      recommendedPublicationList,
    ]
  )
  //#endregion

  //#region bookmark list
  const {
    refresh: refreshBookmarkList,
    remove,
    ...bookmarkList
  } = useBookmarkList()

  const handlePublicationAddFavorite = useCallback(async () => {
    await onPublicationAddFavorite()
    refreshBookmarkList()
  }, [onPublicationAddFavorite, refreshBookmarkList])

  const handlePublicationRemoveFavorite = useCallback(async () => {
    await onPublicationRemoveFavorite()
    refreshBookmarkList()
  }, [onPublicationRemoveFavorite, refreshBookmarkList])

  useEffect(() => {
    refreshBookmarkList()
  }, [refreshBookmarkList])
  //#endregion

  return {
    onSearch,
    onView,
    publicationViewer: {
      onAddFavorite: handlePublicationAddFavorite,
      onRemoveFavorite: handlePublicationRemoveFavorite,
      ...publicationViewer,
    },
    followingList,
    bookmarkList,
  } as const
}
