import { ThemeProvider, useTheme, type Theme } from '@emotion/react'
import { useEffect, useMemo, useState } from 'react'

export { ThemeProvider, useTheme }

declare module '@emotion/react' {
  // TODO: fix this
  interface Theme {
    colors: {
      background: string
      backgroundInverse: string
      positive: string
      negative: string
      primary: string
      secondary: string
      tertiary: string
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
    typography: {
      type: {
        primary: string
        code: string
      }
      weight: {
        regular: number
        bold: number
        extrabold: number
        black: number
      }
      size: {
        s1: number
        s2: number
        s3: number
        m1: number
        m2: number
        m3: number
        l1: number
        l2: number
        l3: number
      }
    }
  }
}

export const lightTheme: Theme = {
  colors: {
    background: '#F6F9FC',
    backgroundInverse: '#7A8997',
    positive: '#E1FFD4',
    negative: '#FEDED2',
    primary: '#FF4785',
    secondary: '#1EA7FD',
    tertiary: '#DDDDDD',
    text: '#222222',
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
  typography: {
    type: {
      primary: '"Nunito Sans", "Helvetica Neue", Helvetica, Arial, sans-serif',
      code: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace',
    },
    weight: {
      regular: 400,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
    size: {
      s1: 12,
      s2: 14,
      s3: 16,
      m1: 20,
      m2: 24,
      m3: 28,
      l1: 32,
      l2: 40,
      l3: 48,
    },
  },
}

// TODO
export const darkTheme: Theme = {
  ...lightTheme,
  colors: {
    background: '#1b1c1d',
    backgroundInverse: '#333333',
    positive: '#9fd986',
    negative: '#df987d',
    primary: '#d43369',
    secondary: '#1b8bd0',
    tertiary: '#DDDDDD',
    text: '#FFFFFF',
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
