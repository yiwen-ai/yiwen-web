import { type ToastAPI } from '@yiwen-ai/component'
import {
  ObjectKind,
  useBookmarkList,
  type BookmarkOutput,
} from '@yiwen-ai/store'
import { useCallback } from 'react'
import { useCollectionViewer } from './useCollectionViewer'
import { usePublicationViewer } from './usePublicationViewer'

export function useBookmarkPage(pushToast: ToastAPI['pushToast']) {
  const {
    refresh: refreshBookmarkList,
    remove,
    ...bookmarkList
  } = useBookmarkList()

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
    (item: BookmarkOutput) => {
      if (item.kind === ObjectKind.Collection) {
        showCollectionViewer(item.gid, item.cid, item.language)
      } else {
        showPublicationViewer(item.gid, item.cid, item.language, item.version)
      }
    },
    [showCollectionViewer, showPublicationViewer]
  )

  const onRemove = useCallback((item: BookmarkOutput) => remove(item), [remove])

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
    ...bookmarkList,
    onView,
    onRemove,
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
  } as const
}
