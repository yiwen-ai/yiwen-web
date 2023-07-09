import { ThemeProvider, useTheme, type Theme } from '@emotion/react'
import { useEffect, useMemo, useState, type CSSProperties } from 'react'

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
      heading0: Typography
      heading1: Typography
      heading2: Typography
      bodyText: Typography
      bodyTextBold: Typography
      tooltip: Typography
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
    heading0: {
      fontSize: '42px',
      fontWeight: 600,
      lineHeight: '50px',
    },
    heading1: {
      fontSize: '28px',
      fontWeight: 400,
      lineHeight: '36px',
    },
    heading2: {
      fontSize: '20px',
      fontWeight: 400,
      lineHeight: '28px',
    },
    bodyText: {
      fontSize: '16px',
      fontWeight: 400,
      lineHeight: '28px',
    },
    bodyTextBold: {
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
}

export const darkTheme: Theme = {
  ...lightTheme,
  color: {
    // TODO
    ...lightTheme.color,
    // TODO
    background: lightTheme.color.grayNormal,
    text: lightTheme.color.grayLight1,
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
