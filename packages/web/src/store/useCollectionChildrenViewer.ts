import { type ToastAPI } from '@yiwen-ai/component'
import { useCollectionChildren } from '@yiwen-ai/store'

export function useCollectionChildrenViewer(
  pushToast: ToastAPI['pushToast'],
  _gid: string | undefined,
  _cid: string | undefined,
  _language: string | undefined
) {
  const {
    error,
    isLoading,
    isValidating,
    items,
    hasMore,
    loadMore,
    refresh,
    addChildren,
    updateChild,
    removeChild,
  } = useCollectionChildren(_gid, _cid, _language)

  return {
    error,
    isLoading,
    isValidating,
    items,
    hasMore,
    loadMore,
    refresh,
    addChildren,
    updateChild,
    removeChild,
  } as const
}
