import CommonEditor from '#/components/CommonEditor'
import { GroupDetailTabKey } from '#/pages/group/[gid]'
import { useEditCreation } from '@yiwen-ai/store'
import { useSearchParams } from 'react-router-dom'

export default function NewCreation() {
  const [searchParams] = useSearchParams()
  const store = useEditCreation(searchParams.get('gid'), undefined)

  return <CommonEditor type={GroupDetailTabKey.Creation} store={store} />
}
