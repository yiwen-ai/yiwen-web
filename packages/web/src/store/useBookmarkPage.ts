import { type ToastAPI } from '@yiwen-ai/component'
import { useBookmarkList, type BookmarkOutput } from '@yiwen-ai/store'
import { useCallback, useEffect } from 'react'
import { usePublicationViewer } from './usePublicationViewer'

export function useBookmarkPage(pushToast: ToastAPI['pushToast']) {
  const {
    refresh: refreshBookmarkList,
    remove,
    ...bookmarkList
  } = useBookmarkList()

  useEffect(() => {
    refreshBookmarkList()
  }, [refreshBookmarkList])

  const {
    show: showPublicationViewer,
    refresh: refreshPublicationViewer,
    onAddFavorite: onPublicationAddFavorite,
    onRemoveFavorite: onPublicationRemoveFavorite,
    ...publicationViewer
  } = usePublicationViewer(pushToast)

  const onView = useCallback(
    (item: BookmarkOutput) => {
      showPublicationViewer(item.gid, item.cid, item.language, item.version)
    },
    [showPublicationViewer]
  )

  const onRemove = useCallback((item: BookmarkOutput) => remove(item), [remove])

  const handlePublicationAddFavorite = useCallback(async () => {
    await onPublicationAddFavorite()
    refreshBookmarkList()
  }, [onPublicationAddFavorite, refreshBookmarkList])

  const handlePublicationRemoveFavorite = useCallback(async () => {
    await onPublicationRemoveFavorite()
    refreshBookmarkList()
  }, [onPublicationRemoveFavorite, refreshBookmarkList])

  return {
    ...bookmarkList,
    onView,
    onRemove,
    publicationViewer: {
      onAddFavorite: handlePublicationAddFavorite,
      onRemoveFavorite: handlePublicationRemoveFavorite,
      ...publicationViewer,
    },
  } as const
}
