import { css } from '@emotion/react'
import { useAuthorize } from '@yiwen-ai/store'
import { memo, useCallback } from 'react'
import { Avatar } from './Avatar'
import { Dialog } from './Dialog'
import { Text } from './Text'

export interface AccountManagerProps
  extends React.HTMLAttributes<HTMLDivElement> {}

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
        <Text type="heading1">{'登录到 yiwen.ai'}</Text>
        <button onClick={onSignInWithGitHub} disabled={isAuthorizing}>
          <div>
            {provider === 'github' ? '使用 GitHub 登录中…' : '使用 GitHub 登录'}
          </div>
        </button>
      </div>
    </Dialog>
  )
})
