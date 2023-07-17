import {
  ThemeProvider,
  useTheme,
  type CSSObject,
  type Theme,
} from '@emotion/react'
import { useUser, type ColorScheme } from '@yiwen-ai/store'
import { useCallback, useEffect, useMemo, useState } from 'react'

export { ThemeProvider, useTheme }

interface Typography
  extends Required<Pick<CSSObject, 'fontSize' | 'fontWeight' | 'lineHeight'>> {}

declare module '@emotion/react' {
  /**
   * @see https://www.figma.com/file/JXx2A1nhVCCDSSM3zGC8rf/Yiwen-AI-team-library?type=design&t=rWzXeFLxlQ4zVkrH-6
   */
  interface Theme {
    /**
     * color palette
     */
    palette: {
      primaryNormal: string
      primaryLight: string
      grayNormal1: string
      grayNormal: string
      grayLight: string
      grayLight0: string
      grayLight1: string
      black: string
      white: string
      orange: string
      green: string
    }
    /**
     * semantic color
     */
    color: {
      body: {
        background: string
        text: string
      }
      button: {
        primary: {
          contained: {
            border: string
            background: string
            text: string
            hover: {
              border: string
              background: string
              text: string
            }
          }
          outlined: {
            border: string
            background: string
            text: string
            hover: {
              border: string
              background: string
              text: string
            }
          }
        }
        secondary: {
          contained: {
            border: string
            background: string
            text: string
            hover: {
              border: string
              background: string
              text: string
            }
          }
          outlined: {
            border: string
            background: string
            text: string
            hover: {
              border: string
              background: string
              text: string
            }
          }
        }
      }
    }
    /**
     * font family
     */
    font: {
      body: string
      code: string
    }
    /**
     * typography
     */
    typography: {
      h1: Typography
      h2: Typography
      h3: Typography
      body: Typography
      bodyBold: Typography
      tooltip: Typography
    }
    /**
     * effect
     */
    effect: {
      shadow: string
    }
  }
}

const palette: Theme['palette'] = {
  primaryNormal: '#745DF9',
  primaryLight: '#988BFF',
  grayNormal1: '#2D2C52',
  grayNormal: '#1F1E40',
  grayLight: '#7C7C94',
  grayLight0: '#CECEE2',
  grayLight1: '#F7F7FB',
  black: '#000000',
  white: '#FFFFFF',
  orange: '#DA442F',
  green: '#4BA755',
}

export const lightTheme: Theme = {
  palette,
  color: {
    body: {
      background: palette.white,
      text: palette.grayNormal,
    },
    button: {
      primary: {
        contained: {
          border: palette.primaryNormal,
          background: palette.primaryNormal,
          text: palette.white,
          hover: {
            border: palette.primaryLight,
            background: palette.primaryLight,
            text: palette.white,
          },
        },
        outlined: {
          border: palette.primaryNormal,
          background: palette.grayLight1,
          text: palette.primaryNormal,
          hover: {
            border: palette.primaryNormal,
            background: palette.grayLight0,
            text: palette.primaryNormal,
          },
        },
      },
      secondary: {
        contained: {
          border: palette.grayLight1,
          background: palette.grayLight1,
          text: palette.grayLight,
          hover: {
            border: palette.grayLight0,
            background: palette.grayLight0,
            text: palette.grayLight,
          },
        },
        outlined: {
          border: palette.grayLight0,
          background: palette.grayLight1,
          text: palette.grayLight,
          hover: {
            border: palette.grayLight,
            background: palette.grayLight0,
            text: palette.grayLight,
          },
        },
      },
    },
  },
  font: {
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
    code: '"SFMono-Regular", "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
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
    body: {
      background: palette.grayNormal,
      text: palette.grayLight1,
    },
    button: {
      primary: {
        contained: {
          border: palette.primaryNormal,
          background: palette.primaryNormal,
          text: palette.white,
          hover: {
            border: palette.primaryLight,
            background: palette.primaryLight,
            text: palette.white,
          },
        },
        outlined: {
          border: palette.grayLight,
          background: palette.grayNormal,
          text: palette.grayLight0,
          hover: {
            border: palette.grayLight,
            background: palette.grayNormal1,
            text: palette.grayLight0,
          },
        },
      },
      secondary: {
        contained: {
          border: palette.grayLight1,
          background: palette.grayLight1,
          text: palette.grayLight,
          hover: {
            border: palette.grayLight0,
            background: palette.grayLight0,
            text: palette.grayLight,
          },
        },
        outlined: {
          border: palette.grayLight,
          background: palette.grayNormal,
          text: palette.grayLight,
          hover: {
            border: palette.grayLight0,
            background: palette.grayNormal1,
            text: palette.grayLight,
          },
        },
      },
    },
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
