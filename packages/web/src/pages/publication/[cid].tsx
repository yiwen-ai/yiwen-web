import { GROUP_DETAIL_PATH } from '#/App'
import CommonEditor from '#/components/CommonEditor'
import SaveHeader from '#/components/SaveHeader'
import { useEditPublicationPage } from '#/store/useEditPublicationPage'
import { GroupViewType } from '#/store/useGroupDetailPage'
import { useCallback } from 'react'
import {
  generatePath,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import { Xid } from 'xid-ts'

export default function EditPublicationPage() {
  const params = useParams<{ cid: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const { draft, updateDraft, isLoading, isDisabled, isSaving, save } =
    useEditPublicationPage(
      searchParams.get('gid'),
      params.cid,
      searchParams.get('language'),
      searchParams.get('version')
    )

  const onSave = useCallback(async () => {
    const item = await save()
    navigate({
      pathname: generatePath(GROUP_DETAIL_PATH, {
        gid: Xid.fromValue(item.gid).toString(),
      }),
      search: new URLSearchParams({
        cid: Xid.fromValue(item.cid).toString(),
        language: item.language,
        version: item.version.toString(),
        type: GroupViewType.Publication,
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
        type={GroupViewType.Publication}
        draft={draft}
        updateDraft={updateDraft}
        isLoading={isLoading}
        isSaving={isSaving}
      />
    </>
  )
}
