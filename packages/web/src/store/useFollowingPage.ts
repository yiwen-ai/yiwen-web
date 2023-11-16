import { type ToastAPI } from '@yiwen-ai/component'
import {
  useFollowedPublicationList,
  type PublicationOutput,
} from '@yiwen-ai/store'
import { useCallback } from 'react'
import { usePublicationViewer } from './usePublicationViewer'

export function useFollowingPage(pushToast: ToastAPI['pushToast']) {
  const { ...followedPublicationList } = useFollowedPublicationList()

  const {
    show: showPublicationViewer,
    refresh: refreshPublicationViewer,
    ...publicationViewer
  } = usePublicationViewer(pushToast)

  const onView = useCallback(
    (item: PublicationOutput) => {
      showPublicationViewer(item.gid, item.cid, item.language, item.version)
    },
    [showPublicationViewer]
  )

  return {
    followedPublicationList,
    onView,
    publicationViewer,
  } as const
}
