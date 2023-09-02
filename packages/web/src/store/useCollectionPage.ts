import { type ToastAPI } from '@yiwen-ai/component'
import { useCollectionList, type CollectionOutput } from '@yiwen-ai/store'
import { useCallback, useEffect } from 'react'
import { usePublicationViewer } from './usePublicationViewer'

export function useCollectionPage(pushToast: ToastAPI['pushToast']) {
  const { refresh, mutate, remove, ...collectionList } = useCollectionList()

  useEffect(() => {
    refresh().catch(() => {})
  }, [refresh])

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
    refresh()
  }, [onPublicationAddFavorite, refresh])

  const handlePublicationRemoveFavorite = useCallback(async () => {
    await onPublicationRemoveFavorite()
    refresh()
  }, [onPublicationRemoveFavorite, refresh])

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
