import { type ToastAPI } from '@yiwen-ai/component'
import {
  useSearch,
  useSearchAPI,
  type PublicationOutput,
  type SearchDocument,
} from '@yiwen-ai/store'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDebounce } from 'use-debounce'
import { Xid } from 'xid-ts'
import { usePublicationViewer } from './usePublicationViewer'

export function useSearchPage(
  pushToast: ToastAPI['pushToast'],
  defaultKeyword = ''
) {
  const [keyword, onSearch] = useState(defaultKeyword)
  const [debouncedKeyword] = useDebounce(keyword.trim(), 500)

  const { search } = useSearchAPI()
  const params = useMemo<Parameters<typeof search>[0]>(
    () => ({
      q: debouncedKeyword,
      language: undefined,
      gid: undefined,
    }),
    [debouncedKeyword]
  )
  const { isLoading, error, data, refresh } = useSearch(params)

  useEffect(() => {
    const controller = new AbortController()
    refresh(search(params, controller.signal)).catch(() => {})
    return () => controller.abort()
  }, [params, refresh, search])

  const [currentDocument, setCurrentDocument] = useState<
    SearchDocument | PublicationOutput | undefined
  >()

  const { _gid, _cid, _language, _version } = useMemo(() => {
    if (!currentDocument) return {}
    return {
      _gid: Xid.fromValue(currentDocument.gid).toString(),
      _cid: Xid.fromValue(currentDocument.cid).toString(),
      _language: currentDocument.language,
      _version: currentDocument.version,
    }
  }, [currentDocument])

  const {
    refresh: refreshPublication,
    onTranslate: onPublicationTranslate,
    ...publicationViewer
  } = usePublicationViewer(pushToast, _gid, _cid, _language, _version)

  useEffect(() => {
    refreshPublication().catch(() => {})
  }, [refreshPublication])

  const onView = useCallback(
    (item: SearchDocument) => setCurrentDocument(item),
    []
  )

  const onPublicationViewerClose = useCallback(() => {
    setCurrentDocument(undefined)
  }, [])

  const handlePublicationTranslate = useCallback(
    async (language: string) => {
      const publication = await onPublicationTranslate(language)
      setCurrentDocument(publication)
    },
    [onPublicationTranslate]
  )

  return {
    isLoading,
    error,
    data,
    keyword,
    onSearch,
    onView,
    publicationViewer: {
      onTranslate: handlePublicationTranslate,
      ...publicationViewer,
    },
    publicationViewerOpen: !!currentDocument,
    onPublicationViewerClose,
  } as const
}
