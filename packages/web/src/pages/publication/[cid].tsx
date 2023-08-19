import CommonEditor from '#/components/CommonEditor'
import { GroupDetailTabKey } from '#/pages/group/[gid]'
import { useEditPublication } from '@yiwen-ai/store'
import { useParams, useSearchParams } from 'react-router-dom'

export default function PublicationEdit() {
  const params = useParams<{ cid: string }>()
  const [searchParams] = useSearchParams()
  const store = useEditPublication(
    searchParams.get('gid'),
    params.cid,
    searchParams.get('language'),
    searchParams.get('version')
  )

  return <CommonEditor type={GroupDetailTabKey.Publication} store={store} />
}
