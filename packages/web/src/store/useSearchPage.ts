import { type ToastAPI } from '@yiwen-ai/component'
import {
  useSearch,
  type BookmarkOutput,
  type PublicationOutput,
  type SearchDocument,
  type SearchInput,
} from '@yiwen-ai/store'
import { toURLSearchParams } from '@yiwen-ai/util'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDebounce } from 'use-debounce'
import { usePublicationViewer } from './usePublicationViewer'
import { useResponsiveTabSection } from './useResponsiveTabSection'

export function useSearchPage(pushToast: ToastAPI['pushToast']) {
  const [searchParams, setSearchParams] = useSearchParams()

  //#region params
  const [keyword, setKeyword] = useState(searchParams.get('q')?.trim() ?? '')
  const [debouncedKeyword] = useDebounce(keyword.trim(), 500)

  const params = useMemo<Record<keyof SearchInput, string | null | undefined>>(
    () => ({
      q: debouncedKeyword,
      language: undefined,
      gid: undefined,
    }),
    [debouncedKeyword]
  )
  //#endregion

  //#region search
  const { isLoading, error, data, refresh } = useSearch(
    params.q,
    params.language,
    params.gid
  )

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    setSearchParams(
      toURLSearchParams({
        ...params,
        q: params.q || undefined,
      })
    )
  }, [params, setSearchParams])
  //#endregion

  //#region publication viewer
  const {
    show: showPublicationViewer,
    refresh: refreshPublicationViewer,
    onAddFavorite: onPublicationAddFavorite,
    onRemoveFavorite: onPublicationRemoveFavorite,
    ...publicationViewer
  } = usePublicationViewer(pushToast)

  const onView = useCallback(
    (item: SearchDocument | PublicationOutput | BookmarkOutput) => {
      showPublicationViewer(item.gid, item.cid, item.language, item.version)
    },
    [showPublicationViewer]
  )
  //#endregion

  const {
    refreshFollowedPublicationList,
    refreshRecommendedPublicationList,
    refreshBookmarkList,
    ...responsiveTabSection
  } = useResponsiveTabSection()

  const handlePublicationAddFavorite = useCallback(async () => {
    await onPublicationAddFavorite()
    refreshBookmarkList()
  }, [onPublicationAddFavorite, refreshBookmarkList])

  const handlePublicationRemoveFavorite = useCallback(async () => {
    await onPublicationRemoveFavorite()
    refreshBookmarkList()
  }, [onPublicationRemoveFavorite, refreshBookmarkList])

  return {
    isLoading,
    error,
    data,
    keyword,
    setKeyword,
    onView,
    publicationViewer: {
      onAddFavorite: handlePublicationAddFavorite,
      onRemoveFavorite: handlePublicationRemoveFavorite,
      ...publicationViewer,
    },
    responsiveTabSection: {
      onView,
      ...responsiveTabSection,
    },
  } as const
}
