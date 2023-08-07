import { createContext, createElement, useContext, useMemo } from 'react'
import { useAccessToken } from './useAccessToken'
import { useAuthorize, type IdentityProvider } from './useAuthorize'
import { useUser, type User } from './useUser'

interface UserAPI {
  isLoading: boolean
  user: User | undefined
  accessToken: string | undefined
  refresh: () => Promise<void>
  authorize: (provider: IdentityProvider) => Promise<void>
  isAuthorizing: boolean
  provider: IdentityProvider | undefined
}

const UserContext = createContext<UserAPI | null>(null)

export function useUserAPI() {
  return useContext(UserContext)
}

export function UserProvider(props: React.PropsWithChildren) {
  const { isLoading: isLoadingUser, user, refresh: refreshUser } = useUser()
  const {
    isLoading: isLoadingAccessToken,
    accessToken,
    refresh: refreshAccessToken,
  } = useAccessToken()
  const { authorize, isAuthorizing, provider } = useAuthorize()
  const isLoading = isLoadingUser || isLoadingAccessToken

  const value = useMemo<UserAPI>(
    () => ({
      isLoading,
      user,
      accessToken,
      refresh: async () => {
        await Promise.all([refreshUser(), refreshAccessToken()])
      },
      authorize,
      isAuthorizing,
      provider,
    }),
    [
      accessToken,
      authorize,
      isAuthorizing,
      isLoading,
      provider,
      refreshAccessToken,
      refreshUser,
      user,
    ]
  )

  return createElement(
    UserContext.Provider,
    { value },
    isLoading ? null : props.children
  )
}
