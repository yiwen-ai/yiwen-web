import { type ToastAPI } from '@yiwen-ai/component'
import {
  useFollowedPublicationList,
  type PublicationOutput,
} from '@yiwen-ai/store'
import { useCallback, useEffect } from 'react'
import { usePublicationViewer } from './usePublicationViewer'

export function useSubscriptionPage(pushToast: ToastAPI['pushToast']) {
  const {
    refresh: refreshFollowedPublicationList,
    ...followedPublicationList
  } = useFollowedPublicationList()

  useEffect(() => {
    refreshFollowedPublicationList()
  }, [refreshFollowedPublicationList])

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
