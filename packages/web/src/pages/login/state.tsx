import { Header } from '@yiwen-ai/component'
import { AuthenticationResult } from '@yiwen-ai/store'
import { useChannel, useLayoutEffect } from '@yiwen-ai/util'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

export default function LoginState() {
  const [params] = useSearchParams()
  const status = useMemo(() => Number(params.get('status')), [params])
  const channel = useChannel(window.opener as Window | null)

  useLayoutEffect(() => {
    channel?.send(AuthenticationResult({ status }))
  }, [channel, status])

  return (
    <>
      <Header />
      <main>
        <h2>
          {status === 200
            ? 'Login success, you can close this page now.'
            : 'Failed to login, please try again or contact us.'}
        </h2>
      </main>
    </>
  )
}
