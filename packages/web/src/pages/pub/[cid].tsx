import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

export default function PublicationShare() {
  const { id } = useParams<{ id: string }>()
  const item = useMemo(() => ({ id }), [id])

  return (
    <div>
      <h1>{`Publication Share Page: ${item.id}`}</h1>
    </div>
  )
}
