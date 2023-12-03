import { GROUP_DETAIL_PATH, NEW_CREATION_PATH } from '#/App'
import { type ToastAPI } from '@yiwen-ai/component'
import {
  ObjectKind,
  createBlobURL,
  isInWechat,
  useSearch,
  type ObjectParams,
  type ScrapingOutput,
  type SearchInput,
} from '@yiwen-ai/store'
import { toURLSearchParams } from '@yiwen-ai/util'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { generatePath, useNavigate, useSearchParams } from 'react-router-dom'
import { useDebounce } from 'use-debounce'
import { Xid } from 'xid-ts'
import { useCollectionViewer } from './useCollectionViewer'
import { useCreateFromFileDialog } from './useCreateFromFileDialog'
import { useCreateFromLinkDialog } from './useCreateFromLinkDialog'
import { usePublicationViewer } from './usePublicationViewer'
import { useResponsiveTabSection } from './useResponsiveTabSection'

export function useSearchPage(pushToast: ToastAPI['pushToast']) {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

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
  const { isLoading, error, data } = useSearch(
    params.q,
    params.language,
    params.gid
  )

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
    (item: ObjectParams) => {
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
    [showPublicationViewer, showCollectionViewer, navigate]
  )
  //#endregion

  //#region following list & bookmark list
  const {
    refreshFollowedPublicationList,
    refreshRecommendedPublicationList,
    refreshBookmarkList,
    ...responsiveTabSection
  } = useResponsiveTabSection()

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
  //#endregion

  //#region create from file/link dialog
  const navigateToCreate = useCallback(
    (result: ScrapingOutput) => {
      navigate({
        pathname: NEW_CREATION_PATH,
        search: toURLSearchParams({
          scrapingOutput: createBlobURL(result),
        }).toString(),
      })
    },
    [navigate]
  )

  const { onUpload, ...createFromFileDialog } =
    useCreateFromFileDialog(pushToast)

  const { onCrawl, ...createFromLinkDialog } =
    useCreateFromLinkDialog(pushToast)

  const handleUpload = useCallback(async () => {
    const result = await onUpload()
    if (result) navigateToCreate(result)
  }, [navigateToCreate, onUpload])

  const handleCrawl = useCallback(async () => {
    const result = await onCrawl()
    if (result) navigateToCreate(result)
  }, [navigateToCreate, onCrawl])
  //#endregion

  return {
    isLoading,
    error,
    data,
    keyword,
    setKeyword,
    onView,
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
    responsiveTabSection: {
      onView,
      ...responsiveTabSection,
    },
    createFromFileDialog: {
      onUpload: handleUpload,
      ...createFromFileDialog,
    },
    createFromLinkDialog: {
      onCrawl: handleCrawl,
      ...createFromLinkDialog,
    },
  } as const
}
