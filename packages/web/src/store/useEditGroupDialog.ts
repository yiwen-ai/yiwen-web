import { type ToastAPI } from '@yiwen-ai/component'
import {
  toMessage,
  useGroup,
  useGroupAPI,
  useUploadAPI,
  type GroupDraft,
  type UpdateGroupInput,
} from '@yiwen-ai/store'
import { isBlobURL } from '@yiwen-ai/util'
import { useCallback, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import { lastValueFrom } from 'rxjs'
import { Xid } from 'xid-ts'

interface Params {
  open: boolean
  _gid: string | undefined
}

export function useEditGroupDialog(pushToast: ToastAPI['pushToast']) {
  const intl = useIntl()
  const { uploadFromBlobURL } = useUploadAPI()
  const { readGroupLogoUploadPolicy, updateGroupInfo } = useGroupAPI()

  const [isSaving, setIsSaving] = useState(false)

  const [draft, setDraft] = useState<GroupDraft>(() => ({
    name: '',
    logo: '',
    slogan: '',
    __logo_name: '',
  }))

  const [{ open, ...params }, setParams] = useState<Params>({
    open: false,
    _gid: undefined,
  })

  const { groupInfo, refreshGroupInfo } = useGroup(params._gid)

  const show = useCallback((_gid: Uint8Array | string | null | undefined) => {
    setParams((params) => {
      const gid = _gid ? Xid.fromValue(_gid).toString() : undefined
      if (params.open && (params._gid === gid || gid == null)) {
        return params
      }

      return {
        open: true,
        _gid: gid,
      }
    })
  }, [])

  const close = useCallback(() => {
    setParams({
      open: false,
      _gid: undefined,
    })
  }, [])

  useMemo(() => {
    if (params._gid && open && groupInfo) {
      setDraft({
        name: groupInfo.name,
        logo: groupInfo.logo,
        slogan: groupInfo.slogan || '',
      })
      return groupInfo
    }
    return undefined
  }, [open, params._gid, groupInfo])

  const onSave = useCallback(async () => {
    if (!groupInfo) {
      return
    }

    try {
      setIsSaving(true)
      const input: UpdateGroupInput = {
        id: groupInfo.id,
      }
      if (draft.name !== groupInfo.name) {
        input.name = draft.name
      }
      if (draft.slogan && draft.slogan !== groupInfo.slogan) {
        input.slogan = draft.slogan
      }

      if (isBlobURL(draft.logo)) {
        const { result: uploadPolicy } = await readGroupLogoUploadPolicy({
          id: Xid.fromValue(groupInfo.id).toString(),
          fields: undefined,
          cn: undefined,
        })

        const uploadOutput = await lastValueFrom(
          uploadFromBlobURL(uploadPolicy, draft.logo, '') // file name is fixed in group uploadPolicy
        )

        input.logo = uploadOutput.value
      }

      await updateGroupInfo(input)

      close()
      refreshGroupInfo()
      pushToast({
        type: 'success',
        message: intl.formatMessage({ defaultMessage: '保存成功' }),
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
  }, [
    intl,
    groupInfo,
    draft,
    close,
    pushToast,
    setIsSaving,
    updateGroupInfo,
    refreshGroupInfo,
    readGroupLogoUploadPolicy,
    uploadFromBlobURL,
  ])
  //#endregion

  return {
    open,
    draft,
    setDraft,
    show,
    close,
    isSaving,
    onSave,
    onClose: close,
  } as const
}
