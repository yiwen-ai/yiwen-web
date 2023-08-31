import { generatePublicationShareLink } from '#/shared'
import { type ToastAPI } from '@yiwen-ai/component'
import {
  CreationStatus,
  PublicationStatus,
  toMessage,
  useCreationList,
  useFetcherConfig,
  useGroup,
  usePublicationList,
  type CreationOutput,
  type PublicationOutput,
} from '@yiwen-ai/store'
import { useCallback, useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
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
  _version: number | string | null | undefined,
  _type: GroupViewType | null | undefined
) {
  const intl = useIntl()
  const config = useFetcherConfig()

  //#region group info & statistic
  const {
    isLoading,
    error,
    groupInfo,
    groupStatistic,
    refreshGroupInfo,
    refreshGroupStatistic,
  } = useGroup(_gid)

  useEffect(() => {
    Promise.all([refreshGroupInfo(), refreshGroupStatistic()]).catch(() => {})
  }, [refreshGroupInfo, refreshGroupStatistic])
  //#endregion

  const [type, setType] = useState(_type ?? GroupViewType.Publication)

  //#region publication viewer & creation viewer
  const { refresh: refreshPublication, ...publicationViewer } =
    usePublicationViewer(pushToast, _gid, _cid, _language, _version)

  const { refresh: refreshCreation, ...creationViewer } = useCreationViewer(
    _gid,
    _cid
  )

  useEffect(() => {
    if (type === GroupViewType.Publication) refreshPublication()
  }, [refreshPublication, type])

  useEffect(() => {
    if (type === GroupViewType.Creation) refreshCreation()
  }, [refreshCreation, type])
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

  useEffect(() => {
    if (type === GroupViewType.Publication) refreshPublicationList()
  }, [refreshPublicationList, type])

  useEffect(() => {
    if (type === GroupViewType.Creation) refreshCreationList()
  }, [refreshCreationList, type])
  //#endregion

  //#region actions
  const onPublicationPublish = useCallback(
    async (item: PublicationOutput) => {
      try {
        await publishPublication(item)
        if (!config?.SHARE_URL) throw new Error('missing SHARE_URL in config')
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
      config?.SHARE_URL,
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
    type,
    switchType: setType,
    publicationViewer,
    publicationList,
    archivedPublicationList,
    onPublicationPublish,
    onPublicationArchive,
    onPublicationRestore,
    onPublicationDelete,
    onArchivedPublicationDialogShow,
    creationViewer,
    creationList,
    archivedCreationList,
    onCreationRelease,
    onCreationArchive,
    onCreationRestore,
    onCreationDelete,
    onArchivedCreationDialogShow,
  } as const
}
