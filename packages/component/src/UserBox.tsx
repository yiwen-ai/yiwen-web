import { css } from '@emotion/react'
import { useAuthorize, useUser } from '@yiwen-ai/store'
import { memo } from 'react'
import { Avatar } from './Avatar'
import { Dialog } from './Dialog'
import { Text } from './Text'

export interface UserBoxProps extends React.HTMLAttributes<HTMLDivElement> {}

export const UserBox = memo(function UserBox(props: UserBoxProps) {
  const [user] = useUser()
  const authorize = useAuthorize()

  return (
    <Dialog
      {...props}
      trigger={
        <Avatar
          name={'user name'}
          css={css`
            cursor: pointer;
          `}
        />
      }
    >
      <div {...props}>
        <Text type="heading1">{'登录到 yiwen.ai'}</Text>
        <button onClick={() => authorize('github')}>
          <div>{'使用 GitHub 登录'}</div>
        </button>
      </div>
    </Dialog>
  )
})
