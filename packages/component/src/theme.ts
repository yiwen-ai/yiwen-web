import { ThemeProvider, useTheme, type Theme } from '@emotion/react'
import { useUser, type ColorScheme } from '@yiwen-ai/store'
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from 'react'

export { ThemeProvider, useTheme }

interface Typography
  extends Required<
    Pick<CSSProperties, 'fontSize' | 'fontWeight' | 'lineHeight'>
  > {}

declare module '@emotion/react' {
  // TODO: fix this
  interface Theme {
    color: {
      primaryNormal: string
      primaryLight: string
      grayNormal: string
      grayLight: string
      grayLight0: string
      grayLight1: string
      orange: string
      green: string
      // TODO
      background: string
      text: string
    }
    spacing: {
      padding: {
        small: number
        medium: number
        large: number
      }
      borderRadius: {
        small: number
        default: number
      }
    }
    font: {
      primary: string
      code: string
    }
    typography: {
      h1: Typography
      h2: Typography
      h3: Typography
      body: Typography
      bodyBold: Typography
      tooltip: Typography
    }
    effect: {
      shadow: string
    }
  }
}

export const lightTheme: Theme = {
  color: {
    primaryNormal: '#745DF9',
    primaryLight: '#988BFF',
    grayNormal: '#1F1E40',
    grayLight: '#7C7C94',
    grayLight0: '#CECEE2',
    grayLight1: '#F7F7FB',
    orange: '#DA442F',
    green: '#4BA755',
    // TODO
    background: '#F7F7FB',
    text: '#1F1E40',
  },
  spacing: {
    padding: {
      small: 10,
      medium: 20,
      large: 30,
    },
    borderRadius: {
      small: 5,
      default: 10,
    },
  },
  font: {
    primary: '"PingFang SC", sans-serif',
    code: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace',
  },
  typography: {
    h1: {
      fontSize: '42px',
      fontWeight: 600,
      lineHeight: '50px',
    },
    h2: {
      fontSize: '28px',
      fontWeight: 400,
      lineHeight: '36px',
    },
    h3: {
      fontSize: '20px',
      fontWeight: 400,
      lineHeight: '28px',
    },
    body: {
      fontSize: '16px',
      fontWeight: 400,
      lineHeight: '28px',
    },
    bodyBold: {
      fontSize: '16px',
      fontWeight: 600,
      lineHeight: '28px',
    },
    tooltip: {
      fontSize: '12px',
      fontWeight: 400,
      lineHeight: '20px',
    },
  },
  effect: {
    // TODO: wait for design
    shadow: '0px 4px 20px rgba(31, 30, 64, 0.1)',
  },
}

export const darkTheme: Theme = {
  ...lightTheme,
  color: {
    // TODO: wait for design
    ...lightTheme.color,
  },
}

export const useDarkMode = () => {
  const query = useMemo(() => {
    return window.matchMedia('(prefers-color-scheme: dark)')
  }, [])

  const [darkMode, setDarkMode] = useState(query.matches)

  useEffect(() => {
    const handleChange = (ev: MediaQueryListEvent) => {
      setDarkMode(ev.matches)
    }
    query.addEventListener('change', handleChange)
    return () => {
      query.removeEventListener('change', handleChange)
    }
  }, [query])

  return darkMode
}

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
