import {
  EDIT_CREATION_PATH,
  EDIT_PUBLICATION_PATH,
  GROUP_DETAIL_PATH,
} from '#/App'
import { generatePublicationShareLink } from '#/shared'
import { useEditCollectionDialog } from '#/store/useEditCollectionDialog'
import { type ToastAPI } from '@yiwen-ai/component'
import {
  CollectionStatus,
  CreationStatus,
  PublicationStatus,
  getCollectionTitle,
  toMessage,
  useAuth,
  useCollectionList,
  useCreationList,
  useEnsureAuthorized,
  useFetcherConfig,
  useGroup,
  usePublicationList,
  type CollectionOutput,
  type CreationOutput,
  type GPT_MODEL,
  type PublicationOutput,
  type UILanguageItem,
} from '@yiwen-ai/store'
import { useCallback, useEffect, useMemo } from 'react'
import { useIntl } from 'react-intl'
import { generatePath, useNavigate } from 'react-router-dom'
import { Xid } from 'xid-ts'
import { useCollectionViewer } from './useCollectionViewer'
import { useCreateCollectionDialog } from './useCreateCollectionDialog'
import { useCreationViewer } from './useCreationViewer'
import { usePublicationViewer } from './usePublicationViewer'

export enum GroupViewType {
  Collection = 'collection',
  Publication = 'publication',
  Creation = 'creation',
}

export function useGroupDetailPage(
  pushToast: ToastAPI['pushToast'],
  _gid: string | null | undefined,
  _cid: string | null | undefined,
  _language: string | null | undefined,
  _version: string | null | undefined,
  _type: GroupViewType | null | undefined,
  _parent: string | null | undefined
) {
  const intl = useIntl()
  const navigate = useNavigate()
  const config = useFetcherConfig()
  const ensureAuthorized = useEnsureAuthorized()

  //#region group info & statistic
  const { user } = useAuth()

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
          message: intl.formatMessage({ defaultMessage: '关注成功' }),
        })
      } catch (error) {
        pushToast({
          type: 'warning',
          message: intl.formatMessage({ defaultMessage: '关注失败' }),
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
          message: intl.formatMessage({ defaultMessage: '已取消关注' }),
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

  const { close: closeCreateCollectionDialog, ...createCollection } =
    useCreateCollectionDialog(pushToast, _gid)

  const { close: closeEditCollectionDialog, ...editCollection } =
    useEditCollectionDialog(pushToast)

  //#region publication viewer & creation viewer
  const {
    show: showCollectionViewer,
    refresh: refreshCollectionViewer,
    ...collectionViewer
  } = useCollectionViewer(pushToast)
  const { open: collectionViewerOpen, close: closeCollectionViewer } =
    collectionViewer

  const {
    show: showPublicationViewer,
    refresh: refreshPublicationViewer,
    onTranslate,
    onSwitch,
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
    if (_type === GroupViewType.Collection) {
      if (_gid && _cid) {
        if (publicationViewerOpen) {
          closePublicationViewer()
        }
        if (creationViewerOpen) {
          closeCreationViewer()
        }
        showCollectionViewer(_gid, _cid, _language || undefined)
      } else if (collectionViewerOpen) {
        closeCollectionViewer()
      }
    }
  }, [
    _type,
    _cid,
    _gid,
    _language,
    showCollectionViewer,
    collectionViewerOpen,
    closeCollectionViewer,
    publicationViewerOpen,
    closePublicationViewer,
    creationViewerOpen,
    closeCreationViewer,
  ])

  useEffect(() => {
    if (_type === GroupViewType.Publication) {
      if (_gid && _cid && _language && _version != null) {
        if (collectionViewerOpen) {
          closeCollectionViewer()
        }
        if (creationViewerOpen) {
          closeCreationViewer()
        }

        showPublicationViewer(_gid, _cid, _language, _version, _parent)
      } else if (publicationViewerOpen) {
        closePublicationViewer()
      }
    }
  }, [
    _type,
    _cid,
    _gid,
    _language,
    _version,
    _parent,
    showPublicationViewer,
    collectionViewerOpen,
    closeCollectionViewer,
    publicationViewerOpen,
    closePublicationViewer,
    creationViewerOpen,
    closeCreationViewer,
  ])

  useEffect(() => {
    if (_type === GroupViewType.Creation) {
      if (_gid && _cid) {
        if (publicationViewerOpen) {
          closePublicationViewer()
        }
        if (collectionViewerOpen) {
          closeCollectionViewer()
        }
        showCreationViewer(_gid, _cid)
      } else if (creationViewerOpen) {
        closeCreationViewer()
      }
    }
  }, [
    _type,
    _cid,
    _gid,
    showCreationViewer,
    collectionViewerOpen,
    closeCollectionViewer,
    publicationViewerOpen,
    closePublicationViewer,
    creationViewerOpen,
    closeCreationViewer,
  ])
  //#endregion

  //#region publication list & creation list
  const {
    archiveItem: archiveCollection,
    refresh: refreshCollectionList,
    ...collectionList
  } = useCollectionList(_gid, undefined)

  const {
    restoreItem: restoreCollection,
    deleteItem: deleteCollection,
    publishItem: publishCollection,
    refresh: refreshArchivedCollectionList,
    ...archivedCollectionList
  } = useCollectionList(_gid, CollectionStatus.Archived)

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
      _type === GroupViewType.Collection ||
      (groupInfoLoaded && !hasGroupReadPermission)
    ) {
      refreshCollectionList()
    }
  }, [groupInfoLoaded, hasGroupReadPermission, refreshCollectionList, _type])

  useEffect(() => {
    if (
      _type === GroupViewType.Publication ||
      (groupInfoLoaded && !hasGroupReadPermission)
    ) {
      refreshPublicationList()
    }
  }, [groupInfoLoaded, hasGroupReadPermission, refreshPublicationList, _type])

  useEffect(() => {
    if (
      _type === GroupViewType.Creation &&
      groupInfoLoaded &&
      hasGroupReadPermission
    ) {
      refreshCreationList()
    }
  }, [groupInfoLoaded, hasGroupReadPermission, refreshCreationList, _type])
  //#endregion

  //#region actions
  const navigateTo = useCallback(
    (publication: PublicationOutput) => {
      navigate({
        pathname: generatePath(GROUP_DETAIL_PATH, {
          gid: Xid.fromValue(publication.gid).toString(),
          type: GroupViewType.Publication,
        }),
        search: new URLSearchParams({
          cid: Xid.fromValue(publication.cid).toString(),
          language: publication.language,
          version: publication.version.toString(),
        }).toString(),
      })
    },
    [navigate]
  )

  const handlePublicationTranslate = useCallback(
    async (language: UILanguageItem, model: GPT_MODEL) => {
      const publication = await onTranslate(language, model)
      if (publication) navigateTo(publication)
    },
    [navigateTo, onTranslate]
  )

  const handlePublicationSwitch = useCallback(
    async (language: UILanguageItem, canTranslate: boolean) => {
      const publication = await onSwitch(language, canTranslate)
      if (publication) navigateTo(publication)
    },
    [navigateTo, onSwitch]
  )

  const onCollectionArchive = useCallback(
    async (item: CollectionOutput) => {
      try {
        await archiveCollection(item)
        pushToast({
          type: 'success',
          message: intl.formatMessage({ defaultMessage: '归档成功' }),
          description: intl.formatMessage(
            { defaultMessage: '已归档：{title}' },
            { title: getCollectionTitle(item) }
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
    [archiveCollection, intl, pushToast]
  )

  const onCollectionRestore = useCallback(
    async (item: CollectionOutput) => {
      try {
        await restoreCollection(item)
        pushToast({
          type: 'success',
          message: intl.formatMessage({ defaultMessage: '恢复成功' }),
          description: intl.formatMessage(
            { defaultMessage: '已恢复：{title}' },
            { title: getCollectionTitle(item) }
          ),
        })
        refreshCollectionList()
      } catch (error) {
        pushToast({
          type: 'warning',
          message: intl.formatMessage({ defaultMessage: '恢复失败' }),
          description: toMessage(error),
        })
      }
    },
    [intl, pushToast, refreshCollectionList, restoreCollection]
  )

  const onCollectionDelete = useCallback(
    async (item: CollectionOutput) => {
      try {
        await deleteCollection(item)
        pushToast({
          type: 'success',
          message: intl.formatMessage({ defaultMessage: '删除成功' }),
          description: intl.formatMessage(
            { defaultMessage: '已删除：{title}' },
            { title: getCollectionTitle(item) }
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
    [deleteCollection, intl, pushToast]
  )

  const onCollectionPublish = useCallback(
    async (item: CollectionOutput) => {
      try {
        await publishCollection(item)
        pushToast({
          type: 'success',
          message: intl.formatMessage({ defaultMessage: '发布成功' }),
        })
      } catch (error) {
        pushToast({
          type: 'warning',
          message: intl.formatMessage({ defaultMessage: '发布失败' }),
          description: toMessage(error),
        })
      }
    },
    [intl, publishCollection, pushToast]
  )

  const onArchivedCollectionDialogShow = useCallback(() => {
    refreshArchivedCollectionList()
  }, [refreshArchivedCollectionList])

  const onPublicationPublish = useCallback(
    async (item: PublicationOutput) => {
      try {
        await publishPublication(item)
        pushToast({
          type: 'success',
          message: intl.formatMessage({ defaultMessage: '发布成功' }),
          description: generatePublicationShareLink(
            config.SHARE_URL,
            null,
            item.cid,
            item.language,
            null,
            user?.cn
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
      user?.cn,
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
            { defaultMessage: '已归档：{title}' },
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
            { defaultMessage: '已恢复：{title}' },
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
            { defaultMessage: '已删除：{title}' },
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
            { defaultMessage: '已发布审核中：{title}' },
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
            { defaultMessage: '已归档：{title}' },
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
            { defaultMessage: '已恢复：{title}' },
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
            { defaultMessage: '已删除：{title}' },
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
    collectionViewer,
    collectionList: {
      createCollection: {
        onClose: closeCreateCollectionDialog,
        ...createCollection,
      },
      editCollection: {
        onClose: closeEditCollectionDialog,
        ...editCollection,
      },
      hasGroupWritePermission,
      isEditing: collectionList.isRestoring,
      ...collectionList,
    },
    archivedCollectionList: {
      hasGroupWritePermission,
      ...archivedCollectionList,
    },
    onCollectionArchive,
    onCollectionRestore,
    onCollectionPublish,
    // onCollectionEdit,
    onCollectionDelete,
    onArchivedCollectionDialogShow,
    publicationViewer: {
      ...publicationViewer,
      onTranslate: handlePublicationTranslate,
      onSwitch: handlePublicationSwitch,
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
