import { GROUP_DETAIL_PATH } from '#/App'
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
import { useCreateFromLinkDialog } from './useCreateFromLinkDialog'
import { GroupViewType } from './useGroupDetailPage'

export function useNewCreationPage(
  pushToast: ToastAPI['pushToast'],
  _gid: string | null | undefined
) {
  const intl = useIntl()
  const navigate = useNavigate()

  const {
    isAuthorized,
    dialog: { show: showAuthDialog },
  } = useAuth()
  const { createCreation } = useCreationAPI()

  useEffect(() => {
    if (!isAuthorized) showAuthDialog()
  }, [isAuthorized, showAuthDialog])

  //#region draft
  const { locale } = useAuth().user ?? {}

  const { refreshDefaultGroup } = useMyGroupList()

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
    let aborted = false
    Promise.resolve(_gid || refreshDefaultGroup().then((group) => group?.id))
      .then((gid) => {
        if (!aborted && gid) {
          setDraft((prev) => ({
            ...prev,
            gid: Xid.fromValue(gid),
            __isReady: true,
          }))
        }
      })
      .catch(() => {})
    return () => {
      aborted = true
    }
  }, [_gid, refreshDefaultGroup])

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
      const result = await createCreation(draft)
      navigateTo(result.gid, result.id)
    } finally {
      setIsSaving(false)
    }
  }, [createCreation, draft, navigateTo])

  const {
    close: closeCreateFromLinkDialog,
    isCrawling,
    onCrawl,
    ...createFromLinkDialog
  } = useCreateFromLinkDialog(pushToast, draft.gid)

  const [isSavingFromLink, setIsSavingFromLink] = useState(false)

  const handleCreateFromLink = useCallback(async () => {
    const result = await onCrawl()
    if (!result) return

    const { title, content } = result
    if (!title || !content) {
      pushToast({
        type: 'warning',
        message: intl.formatMessage({ defaultMessage: '无法从链接中获取内容' }),
        description: result.url,
      })
      return
    }

    try {
      setIsSavingFromLink(true)
      const content2 = decode(content)
      updateDraft({
        title,
        content: content2,
      })
      const result = await createCreation({
        ...draft,
        title,
        content: content2,
      } as Partial<CreationDraft> as CreationDraft)
      pushToast({
        type: 'success',
        message: intl.formatMessage({ defaultMessage: '创建成功' }),
      })
      navigateTo(result.gid, result.id)
    } catch (error) {
      closeCreateFromLinkDialog()
      pushToast({
        type: 'warning',
        message: intl.formatMessage({ defaultMessage: '创建失败' }),
        description: toMessage(error),
      })
    } finally {
      setIsSavingFromLink(false)
    }
  }, [
    closeCreateFromLinkDialog,
    createCreation,
    draft,
    intl,
    navigateTo,
    onCrawl,
    pushToast,
    updateDraft,
  ])

  return {
    draft,
    updateDraft,
    isLoading,
    isDisabled,
    isSaving,
    onSave,
    createFromLinkDialog: {
      close: closeCreateFromLinkDialog,
      isSaving: isCrawling || isSavingFromLink,
      onSave: handleCreateFromLink,
      ...createFromLinkDialog,
    },
  } as const
}
