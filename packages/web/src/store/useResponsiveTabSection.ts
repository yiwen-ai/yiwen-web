import { BOOKMARK_PATH, FOLLOWING_PATH } from '#/App'
import { type IconName } from '@yiwen-ai/component'
import {
  useAuth,
  useBookmarkList,
  useFollowedPublicationList,
  useRecommendedPublicationList,
  type ObjectParams,
} from '@yiwen-ai/store'
import { useEffect, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import { type To } from 'react-router-dom'

export enum ResponsiveTabKey {
  following = 'following',
  bookmark = 'bookmark',
}

export interface ResponsiveTabItem {
  key: ResponsiveTabKey
  icon: IconName
  title: string
  more: To
  isLoading: boolean
  items: ObjectParams[]
}

export function useResponsiveTabSection() {
  const intl = useIntl()
  const { isAuthorized } = useAuth()

  const [currentTab, setCurrentTab] = useState<ResponsiveTabKey>(
    ResponsiveTabKey.following
  )

  //#region following list
  const {
    isLoading: isLoadingFollowedPublicationList,
    items: followedPublicationList,
    refresh: refreshFollowedPublicationList,
  } = useFollowedPublicationList()

  const {
    isLoading: isLoadingRecommendedPublicationList,
    publicationList: recommendedPublicationList,
    refresh: refreshRecommendedPublicationList,
  } = useRecommendedPublicationList()

  useEffect(() => {
    refreshFollowedPublicationList()
    refreshRecommendedPublicationList()
  }, [refreshFollowedPublicationList, refreshRecommendedPublicationList])

  const followingList = useMemo(
    () => ({
      title:
        followedPublicationList.length ||
        (isAuthorized && isLoadingFollowedPublicationList)
          ? intl.formatMessage({ defaultMessage: '关注' })
          : intl.formatMessage({ defaultMessage: '推荐' }),
      isLoading:
        isLoadingFollowedPublicationList || isLoadingRecommendedPublicationList,
      items: followedPublicationList.length
        ? followedPublicationList
        : recommendedPublicationList ?? [],
    }),
    [
      followedPublicationList,
      intl,
      isAuthorized,
      isLoadingFollowedPublicationList,
      isLoadingRecommendedPublicationList,
      recommendedPublicationList,
    ]
  )
  //#endregion

  //#region bookmark list
  const {
    refresh: refreshBookmarkList,
    remove,
    ...bookmarkList
  } = useBookmarkList()

  useEffect(() => {
    refreshBookmarkList()
  }, [refreshBookmarkList])
  //#endregion

  const items = useMemo<ResponsiveTabItem[]>(
    () => [
      {
        key: ResponsiveTabKey.following,
        icon: 'wanchain',
        title: followingList.title,
        more: FOLLOWING_PATH,
        isLoading: followingList.isLoading,
        items: followingList.items,
      },
      {
        key: ResponsiveTabKey.bookmark,
        icon: 'heart',
        title: intl.formatMessage({ defaultMessage: '书签' }),
        more: BOOKMARK_PATH,
        isLoading: bookmarkList.isLoading,
        items: bookmarkList.items,
      },
    ],
    [
      bookmarkList.isLoading,
      bookmarkList.items,
      followingList.isLoading,
      followingList.items,
      followingList.title,
      intl,
    ]
  )

  return {
    value: currentTab,
    onChange: setCurrentTab,
    items,
    refreshFollowedPublicationList,
    refreshRecommendedPublicationList,
    refreshBookmarkList,
  } as const
}
