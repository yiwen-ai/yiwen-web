import { darkTheme, lightTheme, useDarkMode } from '@yiwen-ai/component/theme'
import { useUser, type ColorScheme } from '@yiwen-ai/store'
import { useCallback, useMemo } from 'react'

export function useUserTheme() {
  const [user] = useUser()
  const userTheme: ColorScheme = user?.theme ?? 'auto'

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const setUserTheme = useCallback((theme: ColorScheme) => {
    // TODO: set user theme
  }, [])

  const darkMode = useDarkMode()

  const theme = useMemo(() => {
    switch (userTheme) {
      case 'light':
        return lightTheme
      case 'dark':
        return darkTheme
      default:
        return darkMode ? darkTheme : lightTheme
    }
  }, [darkMode, userTheme])

  return [theme, userTheme, setUserTheme] as const
}
