import { type ToastAPI } from '@yiwen-ai/component'
import {
  useCollectionList,
  type CollectionOutput,
  type PublicationOutput,
} from '@yiwen-ai/store'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Xid } from 'xid-ts'
import { usePublicationViewer } from './usePublicationViewer'

export function useCollection(pushToast: ToastAPI['pushToast']) {
  const { refresh, mutate, remove, ...collectionList } = useCollectionList()

  useEffect(() => {
    refresh().catch(() => {})
  }, [refresh])

  const [currentCollection, setCurrentCollection] = useState<
    CollectionOutput | PublicationOutput | undefined
  >()

  const { _gid, _cid, _language, _version } = useMemo(() => {
    if (!currentCollection) {
      return {}
    }

    return {
      _gid: Xid.fromValue(currentCollection.gid).toString(),
      _cid: Xid.fromValue(currentCollection.cid).toString(),
      _language: currentCollection.language,
      _version: currentCollection.version,
    }
  }, [currentCollection])

  const {
    refresh: refreshPublication,
    onTranslate: onPublicationTranslate,
    onAddFavorite: onPublicationAddFavorite,
    onRemoveFavorite: onPublicationRemoveFavorite,
    ...publicationViewer
  } = usePublicationViewer(pushToast, _gid, _cid, _language, _version)

  useEffect(() => {
    refreshPublication().catch(() => {})
  }, [refreshPublication])

  const onView = useCallback(
    (item: CollectionOutput) => setCurrentCollection(item),
    []
  )

  const onRemove = useCallback(
    (item: CollectionOutput) => remove(item),
    [remove]
  )

  const onPublicationViewerClose = useCallback(() => {
    setCurrentCollection(undefined)
  }, [])

  const handlePublicationTranslate = useCallback(
    async (language: string) => {
      const publication = await onPublicationTranslate(language)
      setCurrentCollection(publication)
    },
    [onPublicationTranslate]
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
      onTranslate: handlePublicationTranslate,
      onAddFavorite: handlePublicationAddFavorite,
      onRemoveFavorite: handlePublicationRemoveFavorite,
      ...publicationViewer,
    },
    publicationViewerOpen: !!currentCollection,
    onPublicationViewerClose,
  } as const
}
