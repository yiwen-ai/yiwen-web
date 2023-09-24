import { GROUP_DETAIL_PATH } from '#/App'
import { type ToastAPI } from '@yiwen-ai/component'
import {
  decode,
  toMessage,
  useAuth,
  useCreation,
  useCreationAPI,
  type CreationDraft,
} from '@yiwen-ai/store'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import { generatePath, useNavigate } from 'react-router-dom'
import { Xid } from 'xid-ts'
import { GroupViewType } from './useGroupDetailPage'

export function useEditCreationPage(
  pushToast: ToastAPI['pushToast'],
  _gid: string | null | undefined,
  _cid: string | null | undefined
) {
  const intl = useIntl()
  const navigate = useNavigate()
  const { updateCreation } = useCreationAPI()

  //#region draft
  const { locale } = useAuth().user ?? {}

  const { refresh } = useCreation(_gid, _cid)

  const [draft, setDraft] = useState<CreationDraft>(() => ({
    __isReady: false,
    gid: _gid ? Xid.fromValue(_gid) : undefined,
    id: _cid ? Xid.fromValue(_cid) : undefined,
    language: locale,
    updated_at: undefined,
    title: '',
    content: undefined,
  }))

  useEffect(() => {
    const controller = new AbortController()
    refresh()
      .then((creation) => {
        if (!controller.signal.aborted && creation) {
          setDraft((prev) => ({
            ...prev,
            ...creation,
            content: decode(creation.content),
            __isReady: true,
          }))
        }
      })
      .catch(() => {})
    return () => controller.abort()
  }, [refresh])

  const updateDraft = useCallback((draft: Partial<CreationDraft>) => {
    setDraft((prev) => ({ ...prev, ...draft }))
  }, [])
  //#endregion

  const isLoading = !draft.__isReady

  const [isSaving, setIsSaving] = useState(false)

  // TODO: validate draft.content
  const isDisabled = useMemo(() => {
    return (
      isLoading ||
      isSaving ||
      !draft.gid ||
      !draft.id ||
      !draft.language ||
      !draft.title.trim() ||
      !draft.content
    )
  }, [draft, isLoading, isSaving])

  const onSave = useCallback(async () => {
    try {
      setIsSaving(true)
      const result = await updateCreation(draft)
      pushToast({
        type: 'success',
        message: intl.formatMessage({ defaultMessage: '保存成功' }),
      })
      navigate({
        pathname: generatePath(GROUP_DETAIL_PATH, {
          gid: Xid.fromValue(result.gid).toString(),
        }),
        search: new URLSearchParams({
          cid: Xid.fromValue(result.id).toString(),
          type: GroupViewType.Creation,
        }).toString(),
      })
    } catch (error) {
      pushToast({
        type: 'warning',
        message: intl.formatMessage({ defaultMessage: '保存失败' }),
        description: toMessage(error),
      })
    } finally {
      setIsSaving(false)
    }
  }, [draft, intl, navigate, pushToast, updateCreation])

  return {
    draft,
    updateDraft,
    isLoading,
    isDisabled,
    isSaving,
    onSave,
  } as const
}
