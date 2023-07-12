import { AUTHORIZED } from '@yiwen-ai/store'
import { useChannel } from '@yiwen-ai/util'
import { useLayoutEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

export default function LoginState() {
  const [params] = useSearchParams()
  const status = useMemo(() => Number(params.get('status')), [params])
  const channel = useChannel(window.opener as Window | null)

  useLayoutEffect(() => {
    if (status === 200) channel.send(AUTHORIZED)
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
