import { SEARCH_PATH } from '#/App'
import { type ToastAPI } from '@yiwen-ai/component'
import { useCollectionList, type CollectionOutput } from '@yiwen-ai/store'
import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePublicationViewer } from './usePublicationViewer'

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
    show: showPublicationViewer,
    refresh: refreshPublicationViewer,
    onAddFavorite: onPublicationAddFavorite,
    onRemoveFavorite: onPublicationRemoveFavorite,
    ...publicationViewer
  } = usePublicationViewer(pushToast)

  const onView = useCallback(
    (item: CollectionOutput) => {
      showPublicationViewer(item.gid, item.cid, item.language, item.version)
    },
    [showPublicationViewer]
  )
  //#endregion

  //#region collection list
  const {
    refresh: refreshCollectionList,
    remove,
    ...collectionList
  } = useCollectionList()

  const handlePublicationAddFavorite = useCallback(async () => {
    await onPublicationAddFavorite()
    refreshCollectionList()
  }, [onPublicationAddFavorite, refreshCollectionList])

  const handlePublicationRemoveFavorite = useCallback(async () => {
    await onPublicationRemoveFavorite()
    refreshCollectionList()
  }, [onPublicationRemoveFavorite, refreshCollectionList])

  useEffect(() => {
    refreshCollectionList()
  }, [refreshCollectionList])
  //#endregion

  return {
    onSearch,
    onView,
    publicationViewer: {
      onAddFavorite: handlePublicationAddFavorite,
      onRemoveFavorite: handlePublicationRemoveFavorite,
      ...publicationViewer,
    },
    collectionList,
  } as const
}
