import { type ToastAPI } from '@yiwen-ai/component'
import { useSearch, useSearchAPI, type SearchDocument } from '@yiwen-ai/store'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePublicationViewer } from './usePublicationViewer'

export function useSearchPage(
  pushToast: ToastAPI['pushToast'],
  defaultKeyword = ''
) {
  const [keyword, setKeyword] = useState(defaultKeyword)

  const { search } = useSearchAPI()
  const params = useMemo<Parameters<typeof search>[0]>(
    () => ({
      q: defaultKeyword.trim(),
      language: undefined,
      gid: undefined,
    }),
    [defaultKeyword]
  )
  const { isLoading, error, data, refresh } = useSearch(params)

  const controllerRef = useRef<AbortController | null>(null)

  const onSearch = useCallback(
    (keyword: string) => {
      controllerRef.current?.abort()
      const controller = (controllerRef.current = new AbortController())
      refresh(
        search(
          {
            q: keyword.trim(),
            language: undefined,
            gid: undefined,
          },
          controller.signal
        )
      ).catch(() => {})
    },
    [refresh, search]
  )

  useEffect(() => {
    onSearch(defaultKeyword)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const {
    show: showPublicationViewer,
    refresh: refreshPublicationViewer,
    ...publicationViewer
  } = usePublicationViewer(pushToast)

  const onView = useCallback(
    (item: SearchDocument) => {
      showPublicationViewer(item.gid, item.cid, item.language, item.version)
    },
    [showPublicationViewer]
  )

  return {
    isLoading,
    error,
    data,
    keyword,
    setKeyword,
    onSearch,
    onView,
    publicationViewer,
  } as const
}
