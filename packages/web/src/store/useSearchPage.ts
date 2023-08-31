import { type ToastAPI } from '@yiwen-ai/component'
import {
  useSearch,
  useSearchAPI,
  type PublicationOutput,
  type SearchDocument,
} from '@yiwen-ai/store'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Xid } from 'xid-ts'
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
    setKeyword,
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
