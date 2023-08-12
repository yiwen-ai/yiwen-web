import { useAuth } from '@yiwen-ai/store'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

export default function LoginState() {
  const auth = useAuth()
  const [params] = useSearchParams()
  const status = Number(params.get('status'))
  useEffect(() => auth.callback({ status }), [auth, status])

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
