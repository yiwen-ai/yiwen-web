import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

export default function Publication() {
  const { id } = useParams<{ id: string }>()
  const item = useMemo(() => ({ id }), [id])

  return (
    <div>
      <h1>{`Publication ${item.id}`}</h1>
    </div>
  )
}
