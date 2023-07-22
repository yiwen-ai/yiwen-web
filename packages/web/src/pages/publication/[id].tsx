import { Header } from '@yiwen-ai/component'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

export default function PublicationDetail() {
  const { id } = useParams<{ id: string }>()
  const item = useMemo(() => ({ id }), [id])

  return (
    <>
      <Header />
      <main>
        <h1>{`Publication Detail Page: ${item.id}`}</h1>
      </main>
    </>
  )
}
