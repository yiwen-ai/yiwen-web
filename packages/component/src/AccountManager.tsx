import { css } from '@emotion/react'
import { useAuthorize } from '@yiwen-ai/store'
import { memo, useCallback } from 'react'
import { Avatar } from './Avatar'
import { Dialog } from './Dialog'

export interface AccountManagerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  str: {
    loginTitle: string
    githubLogin: string
    githubLoginInProgress: string
  }
}

export const AccountManager = memo(function AccountManager(
  props: AccountManagerProps
) {
  const [user, authorize, isAuthorizing, provider] = useAuthorize()
  const onSignInWithGitHub = useCallback(() => authorize('github'), [authorize])

  const avatar = (
    <Avatar
      src={user?.picture}
      name={user?.name}
      css={css`
        cursor: pointer;
      `}
    />
  )

  return user ? (
    // TODO: click to manage account
    avatar
  ) : (
    <Dialog {...props} trigger={avatar}>
      <div {...props}>
        <h2>{props.str.loginTitle}</h2>
        <button onClick={onSignInWithGitHub} disabled={isAuthorizing}>
          <div>
            {provider === 'github'
              ? props.str.githubLoginInProgress
              : props.str.githubLogin}
          </div>
        </button>
      </div>
    </Dialog>
  )
})
