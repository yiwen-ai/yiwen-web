import { GROUP_DETAIL_PATH } from '#/App'
import { useUploadDocumentImages } from '#/shared'
import { type ToastAPI } from '@yiwen-ai/component'
import {
  decode,
  toMessage,
  useAuth,
  useCreationAPI,
  useMyGroupList,
  type CreationDraft,
} from '@yiwen-ai/store'
import { useCallback, useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { generatePath, useNavigate } from 'react-router-dom'
import { Xid } from 'xid-ts'
import { useCreateFromFileDialog } from './useCreateFromFileDialog'
import { useCreateFromLinkDialog } from './useCreateFromLinkDialog'
import { GroupViewType } from './useGroupDetailPage'

export function useNewCreationPage(
  pushToast: ToastAPI['pushToast'],
  _gid: string | null | undefined
) {
  const intl = useIntl()
  const navigate = useNavigate()
  const { createCreation, readCreationUploadPolicy, updateCreation } =
    useCreationAPI()
  const uploadDocumentImages = useUploadDocumentImages()

  //#region draft
  const { locale } = useAuth().user ?? {}

  const { defaultGroup, refreshDefaultGroup } = useMyGroupList()
  const defaultGroupId = defaultGroup?.id

  const [draft, setDraft] = useState<CreationDraft>(() => ({
    __isReady: false,
    gid: _gid ? Xid.fromValue(_gid) : undefined,
    id: undefined,
    language: locale,
    updated_at: undefined,
    title: '',
    content: undefined,
  }))

  useEffect(() => {
    refreshDefaultGroup()
  }, [refreshDefaultGroup])

  useEffect(() => {
    const gid = draft.gid || defaultGroupId
    setDraft((prev) => ({
      ...prev,
      gid,
      __isReady: !!gid,
    }))
  }, [defaultGroupId, draft.gid])

  const updateDraft = useCallback((draft: Partial<CreationDraft>) => {
    setDraft((prev) => ({ ...prev, ...draft }))
  }, [])
  //#endregion

  const isLoading = !draft.__isReady

  const [isSaving, setIsSaving] = useState(false)

  // TODO: validate draft.content
  const isDisabled =
    isLoading ||
    isSaving ||
    !draft.gid ||
    !draft.language ||
    !draft.title.trim() ||
    !draft.content

  const navigateTo = useCallback(
    (gid: Uint8Array, cid: Uint8Array) => {
      navigate({
        pathname: generatePath(GROUP_DETAIL_PATH, {
          gid: Xid.fromValue(gid).toString(),
        }),
        search: new URLSearchParams({
          cid: Xid.fromValue(cid).toString(),
          type: GroupViewType.Creation,
        }).toString(),
      })
    },
    [navigate]
  )

  const onSave = useCallback(async () => {
    try {
      setIsSaving(true)
      let result = await createCreation(draft)
      const content = await uploadDocumentImages(draft.content, () =>
        readCreationUploadPolicy({
          gid: Xid.fromValue(result.gid).toString(),
          id: Xid.fromValue(result.id).toString(),
          fields: undefined,
        }).then(({ result }) => result)
      )
      if (content) {
        result = await updateCreation(
          { ...result, content } as CreationDraft,
          true
        )
      }
      pushToast({
        type: 'success',
        message: intl.formatMessage({ defaultMessage: '保存成功' }),
      })
      navigateTo(result.gid, result.id)
    } catch (error) {
      pushToast({
        type: 'warning',
        message: intl.formatMessage({ defaultMessage: '保存失败' }),
        description: toMessage(error),
      })
    } finally {
      setIsSaving(false)
    }
  }, [
    createCreation,
    draft,
    intl,
    navigateTo,
    pushToast,
    readCreationUploadPolicy,
    updateCreation,
    uploadDocumentImages,
  ])

  const {
    close: closeCreateFromLinkDialog,
    onCrawl,
    ...createFromLinkDialog
  } = useCreateFromLinkDialog(pushToast, draft.gid)

  const handleCrawl = useCallback(async () => {
    const result = await onCrawl()
    if (!result) return

    const { title, content } = result
    if (!title && !content) {
      pushToast({
        type: 'warning',
        message: intl.formatMessage({ defaultMessage: '无法从链接中获取内容' }),
        description: result.url,
      })
      return
    }

    const draft: Partial<CreationDraft> = {}
    if (title) draft.title = title
    if (content) draft.content = decode(content)
    draft.original_url = result.url
    updateDraft(draft)
    closeCreateFromLinkDialog()
  }, [closeCreateFromLinkDialog, intl, onCrawl, pushToast, updateDraft])

  const {
    close: closeCreateFromFileDialog,
    onUpload,
    ...createFromFileDialog
  } = useCreateFromFileDialog(pushToast, draft.gid)

  const handleUpload = useCallback(async () => {
    const result = await onUpload()
    if (!result) return

    const { title, content } = result
    if (!title && !content) {
      pushToast({
        type: 'warning',
        message: intl.formatMessage({ defaultMessage: '无法从文件中获取内容' }),
        description: result.url,
      })
      return
    }

    const draft: Partial<CreationDraft> = {}
    if (title) draft.title = title
    if (content) draft.content = decode(content)
    updateDraft(draft)
    closeCreateFromFileDialog()
  }, [closeCreateFromFileDialog, intl, onUpload, pushToast, updateDraft])

  return {
    draft,
    updateDraft,
    isLoading,
    isDisabled,
    isSaving,
    onSave,
    createFromLinkDialog: {
      close: closeCreateFromLinkDialog,
      onCrawl: handleCrawl,
      ...createFromLinkDialog,
    },
    createFromFileDialog: {
      close: closeCreateFromFileDialog,
      onUpload: handleUpload,
      ...createFromFileDialog,
    },
  } as const
}
