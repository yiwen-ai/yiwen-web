import { type ToastAPI } from '@yiwen-ai/component'
import { useCollectionList, type CollectionOutput } from '@yiwen-ai/store'
import { useCallback, useEffect } from 'react'
import { usePublicationViewer } from './usePublicationViewer'

export function useCollectionPage(pushToast: ToastAPI['pushToast']) {
  const {
    refresh: refreshCollectionList,
    remove,
    ...collectionList
  } = useCollectionList()

  useEffect(() => {
    refreshCollectionList()
  }, [refreshCollectionList])

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

  const onRemove = useCallback(
    (item: CollectionOutput) => remove(item),
    [remove]
  )

  const handlePublicationAddFavorite = useCallback(async () => {
    await onPublicationAddFavorite()
    refreshCollectionList()
  }, [onPublicationAddFavorite, refreshCollectionList])

  const handlePublicationRemoveFavorite = useCallback(async () => {
    await onPublicationRemoveFavorite()
    refreshCollectionList()
  }, [onPublicationRemoveFavorite, refreshCollectionList])

  return {
    ...collectionList,
    onView,
    onRemove,
    publicationViewer: {
      onAddFavorite: handlePublicationAddFavorite,
      onRemoveFavorite: handlePublicationRemoveFavorite,
      ...publicationViewer,
    },
  } as const
}
