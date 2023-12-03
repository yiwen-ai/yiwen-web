import { GROUP_DETAIL_PATH } from '#/App'
import { type ToastAPI } from '@yiwen-ai/component'
import {
  ObjectKind,
  isInWechat,
  useBookmarkList,
  type BookmarkOutput,
} from '@yiwen-ai/store'
import { useCallback } from 'react'
import { generatePath, useNavigate } from 'react-router-dom'
import { Xid } from 'xid-ts'
import { useCollectionViewer } from './useCollectionViewer'
import { usePublicationViewer } from './usePublicationViewer'

export function useBookmarkPage(pushToast: ToastAPI['pushToast']) {
  const navigate = useNavigate()

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
    [showCollectionViewer, showPublicationViewer, navigate]
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
