import { AuthenticationResult } from '@yiwen-ai/store'
import { useChannel } from '@yiwen-ai/util'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import useIsomorphicLayoutEffect from 'use-isomorphic-layout-effect'

export default function LoginState() {
  const [params] = useSearchParams()
  const status = useMemo(() => Number(params.get('status')), [params])
  const channel = useChannel(window.opener as Window | null)

  useIsomorphicLayoutEffect(() => {
    channel?.send(AuthenticationResult({ status }))
  }, [channel, status])

  return (
    <div>
      <h1>
        {status === 200
          ? 'Login success, you can close this page now.'
          : 'Failed to login, please try again or contact us.'}
      </h1>
    </div>
  )
}
