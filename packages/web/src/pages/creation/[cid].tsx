import { GROUP_DETAIL_PATH } from '#/App'
import CommonEditor from '#/components/CommonEditor'
import SaveHeader from '#/components/SaveHeader'
import { useEditCreation } from '#/store/useEditCreation'
import { GroupViewType } from '#/store/useGroupDetail'
import { useCallback } from 'react'
import {
  generatePath,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import { Xid } from 'xid-ts'

export default function EditCreation() {
  const params = useParams<{ cid: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const { draft, updateDraft, isLoading, isDisabled, isSaving, save } =
    useEditCreation(searchParams.get('gid'), params.cid)

  const onSave = useCallback(async () => {
    const item = await save()
    navigate({
      pathname: generatePath(GROUP_DETAIL_PATH, {
        gid: Xid.fromValue(item.gid).toString(),
      }),
      search: new URLSearchParams({
        cid: Xid.fromValue(item.id).toString(),
        type: GroupViewType.Creation,
      }).toString(),
    })
    return item
  }, [navigate, save])

  return (
    <>
      <SaveHeader
        isLoading={isLoading}
        isDisabled={isDisabled}
        isSaving={isSaving}
        onSave={onSave}
      />
      <CommonEditor
        type={GroupViewType.Creation}
        draft={draft}
        updateDraft={updateDraft}
        isLoading={isLoading}
        isSaving={isSaving}
      />
    </>
  )
}
