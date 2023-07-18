import { Header } from '@yiwen-ai/component'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

export default function Publication() {
  const { id } = useParams<{ id: string }>()
  const item = useMemo(() => ({ id }), [id])

  return (
    <>
      <Header />
      <main>
        <h1>{`Publication ${item.id}`}</h1>
      </main>
    </>
  )
}
