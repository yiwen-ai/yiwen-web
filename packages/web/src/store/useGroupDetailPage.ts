import {
  EDIT_CREATION_PATH,
  EDIT_PUBLICATION_PATH,
  GROUP_DETAIL_PATH,
} from '#/App'
import { generatePublicationShareLink } from '#/shared'
import { type ToastAPI } from '@yiwen-ai/component'
import {
  CreationStatus,
  PublicationStatus,
  toMessage,
  useCreationList,
  useEnsureAuthorized,
  useFetcherConfig,
  useGroup,
  usePublicationList,
  type CreationOutput,
  type PublicationOutput,
  type UILanguageItem,
} from '@yiwen-ai/store'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import { generatePath, useNavigate } from 'react-router-dom'
import { Xid } from 'xid-ts'
import { useCreationViewer } from './useCreationViewer'
import { usePublicationViewer } from './usePublicationViewer'

export enum GroupViewType {
  Publication = 'publication',
  Creation = 'creation',
}

export function useGroupDetailPage(
  pushToast: ToastAPI['pushToast'],
  _gid: string | null | undefined,
  _cid: string | null | undefined,
  _language: string | null | undefined,
  _version: string | null | undefined,
  _type: GroupViewType | null | undefined
) {
  const intl = useIntl()
  const navigate = useNavigate()
  const config = useFetcherConfig()
  const ensureAuthorized = useEnsureAuthorized()

  //#region group info & statistic
  const {
    isLoading,
    error,
    groupInfo,
    groupStatistic,
    hasGroupReadPermission,
    hasGroupWritePermission,
    hasGroupAddCreationPermission,
    refreshGroupInfo,
    refreshGroupStatistic,
    isFollowed: isGroupFollowed,
    isFollowing: isFollowingGroup,
    isUnfollowing: isUnfollowingGroup,
    follow,
    unfollow,
  } = useGroup(_gid)

  useEffect(() => {
    refreshGroupInfo()
    refreshGroupStatistic()
  }, [refreshGroupInfo, refreshGroupStatistic])

  const onGroupFollow = useMemo(() => {
    return ensureAuthorized(async () => {
      try {
        await follow()
        pushToast({
          type: 'success',
          message: intl.formatMessage({ defaultMessage: '订阅成功' }),
        })
      } catch (error) {
        pushToast({
          type: 'warning',
          message: intl.formatMessage({ defaultMessage: '订阅失败' }),
          description: toMessage(error),
        })
      }
    })
  }, [ensureAuthorized, follow, intl, pushToast])

  const onGroupUnfollow = useMemo(() => {
    return ensureAuthorized(async () => {
      try {
        await unfollow()
        pushToast({
          type: 'success',
          message: intl.formatMessage({ defaultMessage: '已取消订阅' }),
        })
      } catch (error) {
        pushToast({
          type: 'warning',
          message: intl.formatMessage({ defaultMessage: '取消失败' }),
          description: toMessage(error),
        })
      }
    })
  }, [ensureAuthorized, intl, pushToast, unfollow])
  //#endregion

  const [viewType, setViewType] = useState(_type ?? GroupViewType.Publication)

  //#region publication viewer & creation viewer
  const {
    show: showPublicationViewer,
    refresh: refreshPublicationViewer,
    onTranslate,
    ...publicationViewer
  } = usePublicationViewer(pushToast)
  const { open: publicationViewerOpen, close: closePublicationViewer } =
    publicationViewer

  const {
    show: showCreationViewer,
    refresh: refreshCreationViewer,
    ...creationViewer
  } = useCreationViewer()
  const { open: creationViewerOpen, close: closeCreationViewer } =
    creationViewer

  useEffect(() => {
    if (
      viewType === GroupViewType.Publication &&
      _gid &&
      _cid &&
      _language &&
      _version != null
    ) {
      showPublicationViewer(_gid, _cid, _language, _version)
    } else if (publicationViewerOpen) {
      closePublicationViewer()
    }
  }, [
    _cid,
    _gid,
    _language,
    _version,
    closePublicationViewer,
    publicationViewerOpen,
    showPublicationViewer,
    viewType,
  ])

  useEffect(() => {
    if (viewType === GroupViewType.Creation && _gid && _cid) {
      showCreationViewer(_gid, _cid)
    } else if (creationViewerOpen) {
      closeCreationViewer()
    }
  }, [
    _cid,
    _gid,
    closeCreationViewer,
    creationViewerOpen,
    showCreationViewer,
    viewType,
  ])
  //#endregion

  //#region publication list & creation list
  const {
    publishItem: publishPublication,
    archiveItem: archivePublication,
    refresh: refreshPublicationList,
    ...publicationList
  } = usePublicationList(_gid, undefined)

  const {
    restoreItem: restorePublication,
    deleteItem: deletePublication,
    refresh: refreshArchivedPublicationList,
    ...archivedPublicationList
  } = usePublicationList(_gid, PublicationStatus.Archived)

  const {
    releaseItem: releaseCreation,
    archiveItem: archiveCreation,
    refresh: refreshCreationList,
    ...creationList
  } = useCreationList(_gid, undefined)

  const {
    restoreItem: restoreCreation,
    deleteItem: deleteCreation,
    refresh: refreshArchivedCreationList,
    ...archivedCreationList
  } = useCreationList(_gid, CreationStatus.Archived)

  const groupInfoLoaded = !!groupInfo

  useEffect(() => {
    if (
      viewType === GroupViewType.Publication ||
      (groupInfoLoaded && !hasGroupReadPermission)
    ) {
      refreshPublicationList()
    }
  }, [
    groupInfoLoaded,
    hasGroupReadPermission,
    refreshPublicationList,
    viewType,
  ])

  useEffect(() => {
    if (
      viewType === GroupViewType.Creation &&
      groupInfoLoaded &&
      hasGroupReadPermission
    ) {
      refreshCreationList()
    }
  }, [groupInfoLoaded, hasGroupReadPermission, refreshCreationList, viewType])
  //#endregion

  //#region actions
  const onPublicationTranslate = useCallback(
    async (language: UILanguageItem) => {
      const publication = await onTranslate(language)
      if (!publication) return
      navigate({
        pathname: generatePath(GROUP_DETAIL_PATH, {
          gid: Xid.fromValue(publication.gid).toString(),
        }),
        search: new URLSearchParams({
          cid: Xid.fromValue(publication.cid).toString(),
          language: publication.language,
          version: publication.version.toString(),
          type: GroupViewType.Publication,
        }).toString(),
      })
    },
    [navigate, onTranslate]
  )

  const onPublicationPublish = useCallback(
    async (item: PublicationOutput) => {
      try {
        await publishPublication(item)
        pushToast({
          type: 'success',
          message: intl.formatMessage({ defaultMessage: '发布成功' }),
          description: generatePublicationShareLink(
            config.SHARE_URL,
            item.gid,
            item.cid,
            item.language,
            item.version
          ),
        })
        refreshGroupStatistic()
      } catch (error) {
        pushToast({
          type: 'warning',
          message: intl.formatMessage({ defaultMessage: '发布失败' }),
          description: toMessage(error),
        })
      }
    },
    [
      config.SHARE_URL,
      intl,
      publishPublication,
      pushToast,
      refreshGroupStatistic,
    ]
  )

  const onPublicationArchive = useCallback(
    async (item: PublicationOutput) => {
      try {
        await archivePublication(item)
        pushToast({
          type: 'success',
          message: intl.formatMessage({ defaultMessage: '归档成功' }),
          description: intl.formatMessage(
            { defaultMessage: '已归档文章：{title}' },
            { title: item.title }
          ),
        })
      } catch (error) {
        pushToast({
          type: 'warning',
          message: intl.formatMessage({ defaultMessage: '归档失败' }),
          description: toMessage(error),
        })
      }
    },
    [archivePublication, intl, pushToast]
  )

  const onPublicationRestore = useCallback(
    async (item: PublicationOutput) => {
      try {
        await restorePublication(item)
        pushToast({
          type: 'success',
          message: intl.formatMessage({ defaultMessage: '恢复成功' }),
          description: intl.formatMessage(
            { defaultMessage: '已恢复文章：{title}' },
            { title: item.title }
          ),
        })
        refreshPublicationList()
      } catch (error) {
        pushToast({
          type: 'warning',
          message: intl.formatMessage({ defaultMessage: '恢复失败' }),
          description: toMessage(error),
        })
      }
    },
    [intl, pushToast, refreshPublicationList, restorePublication]
  )

  const onPublicationEdit = useCallback(
    async (item: PublicationOutput) => {
      try {
        if (item.status !== PublicationStatus.Review) {
          await restorePublication(item)
        }
        navigate({
          pathname: generatePath(EDIT_PUBLICATION_PATH, {
            cid: Xid.fromValue(item.cid).toString(),
          }),
          search: new URLSearchParams({
            gid: Xid.fromValue(item.gid).toString(),
            language: item.language,
            version: item.version.toString(),
            type: GroupViewType.Publication,
          }).toString(),
        })
      } catch (error) {
        pushToast({
          type: 'warning',
          message: intl.formatMessage({ defaultMessage: '修订失败' }),
          description: toMessage(error),
        })
      }
    },
    [intl, navigate, pushToast, restorePublication]
  )

  const onPublicationDelete = useCallback(
    async (item: PublicationOutput) => {
      try {
        await deletePublication(item)
        pushToast({
          type: 'success',
          message: intl.formatMessage({ defaultMessage: '删除成功' }),
          description: intl.formatMessage(
            { defaultMessage: '已删除文章：{title}' },
            { title: item.title }
          ),
        })
      } catch (error) {
        pushToast({
          type: 'warning',
          message: intl.formatMessage({ defaultMessage: '删除失败' }),
          description: toMessage(error),
        })
      }
    },
    [deletePublication, intl, pushToast]
  )

  const onArchivedPublicationDialogShow = useCallback(() => {
    refreshArchivedPublicationList()
  }, [refreshArchivedPublicationList])

  const onCreationRelease = useCallback(
    async (item: CreationOutput) => {
      try {
        await releaseCreation(item)
        pushToast({
          type: 'success',
          message: intl.formatMessage({ defaultMessage: '发布成功' }),
          description: intl.formatMessage(
            { defaultMessage: '已发布待审核：{title}' },
            { title: item.title }
          ),
        })
        refreshPublicationList()
      } catch (error) {
        pushToast({
          type: 'warning',
          message: intl.formatMessage({ defaultMessage: '发布失败' }),
          description: toMessage(error),
        })
      }
    },
    [intl, pushToast, refreshPublicationList, releaseCreation]
  )

  const onCreationArchive = useCallback(
    async (item: CreationOutput) => {
      try {
        await archiveCreation(item)
        pushToast({
          type: 'success',
          message: intl.formatMessage({ defaultMessage: '归档成功' }),
          description: intl.formatMessage(
            { defaultMessage: '已归档文章：{title}' },
            { title: item.title }
          ),
        })
      } catch (error) {
        pushToast({
          type: 'warning',
          message: intl.formatMessage({ defaultMessage: '归档失败' }),
          description: toMessage(error),
        })
      }
    },
    [archiveCreation, intl, pushToast]
  )

  const onCreationRestore = useCallback(
    async (item: CreationOutput) => {
      try {
        await restoreCreation(item)
        pushToast({
          type: 'success',
          message: intl.formatMessage({ defaultMessage: '恢复成功' }),
          description: intl.formatMessage(
            { defaultMessage: '已恢复文章：{title}' },
            { title: item.title }
          ),
        })
        refreshCreationList()
      } catch (error) {
        pushToast({
          type: 'warning',
          message: intl.formatMessage({ defaultMessage: '恢复失败' }),
          description: toMessage(error),
        })
      }
    },
    [intl, pushToast, refreshCreationList, restoreCreation]
  )

  const onCreationEdit = useCallback(
    async (item: CreationOutput) => {
      try {
        if (item.status !== CreationStatus.Draft) {
          await restoreCreation(item)
        }
        navigate({
          pathname: generatePath(EDIT_CREATION_PATH, {
            cid: Xid.fromValue(item.id).toString(),
          }),
          search: new URLSearchParams({
            gid: Xid.fromValue(item.gid).toString(),
            type: GroupViewType.Creation,
          }).toString(),
        })
      } catch (error) {
        pushToast({
          type: 'warning',
          message: intl.formatMessage({ defaultMessage: '更新版本失败' }),
          description: toMessage(error),
        })
      }
    },
    [intl, navigate, pushToast, restoreCreation]
  )

  const onCreationDelete = useCallback(
    async (item: CreationOutput) => {
      try {
        await deleteCreation(item)
        pushToast({
          type: 'success',
          message: intl.formatMessage({ defaultMessage: '删除成功' }),
          description: intl.formatMessage(
            { defaultMessage: '已删除文章：{title}' },
            { title: item.title }
          ),
        })
      } catch (error) {
        pushToast({
          type: 'warning',
          message: intl.formatMessage({ defaultMessage: '删除失败' }),
          description: toMessage(error),
        })
      }
    },
    [deleteCreation, intl, pushToast]
  )

  const onArchivedCreationDialogShow = useCallback(() => {
    refreshArchivedCreationList()
  }, [refreshArchivedCreationList])
  //#endregion

  return {
    isLoading,
    error,
    groupInfo,
    groupStatistic,
    hasGroupReadPermission,
    hasGroupWritePermission,
    hasGroupAddCreationPermission,
    isGroupFollowed,
    isFollowingGroup,
    isUnfollowingGroup,
    onGroupFollow,
    onGroupUnfollow,
    viewType: hasGroupReadPermission ? viewType : GroupViewType.Publication,
    setViewType,
    publicationViewer: {
      ...publicationViewer,
      onTranslate: onPublicationTranslate,
    },
    publicationList: {
      hasGroupWritePermission,
      isEditing: publicationList.isRestoring,
      ...publicationList,
    },
    archivedPublicationList: {
      hasGroupWritePermission,
      ...archivedPublicationList,
    },
    onPublicationPublish,
    onPublicationArchive,
    onPublicationRestore,
    onPublicationEdit,
    onPublicationDelete,
    onArchivedPublicationDialogShow,
    creationViewer,
    creationList: {
      hasGroupWritePermission,
      isEditing: creationList.isRestoring,
      ...creationList,
    },
    archivedCreationList: {
      hasGroupWritePermission,
      ...archivedCreationList,
    },
    onCreationRelease,
    onCreationArchive,
    onCreationRestore,
    onCreationEdit,
    onCreationDelete,
    onArchivedCreationDialogShow,
  } as const
}
