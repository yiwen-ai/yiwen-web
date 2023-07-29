import {
  ThemeProvider,
  useTheme,
  type CSSObject,
  type Theme,
} from '@emotion/react'
import { useUser, type ColorScheme } from '@yiwen-ai/store'
import { RGBA } from '@yiwen-ai/util'
import { useCallback, useEffect, useMemo, useState } from 'react'

export { ThemeProvider, useTheme }

interface Typography
  extends Required<Pick<CSSObject, 'fontSize' | 'fontWeight' | 'lineHeight'>> {}

interface ButtonColor {
  border: string
  background: string
  text: string
}

interface Button extends ButtonColor {
  hover: ButtonColor
  disabled: ButtonColor
}

declare module '@emotion/react' {
  /**
   * @see https://www.figma.com/file/JXx2A1nhVCCDSSM3zGC8rf/Yiwen-AI-team-library?type=design&t=rWzXeFLxlQ4zVkrH-6
   */
  interface Theme {
    name: Exclude<ColorScheme, 'auto'>
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
        primary: string
        secondary: string
      }
      divider: {
        primary: string
        secondary: string
      }
      link: {
        normal: string
        hover: string
      }
      button: {
        primary: {
          contained: Button
          outlined: Button
        }
        secondary: {
          contained: Button
          outlined: Button
        }
        tile: ButtonColor & {
          hover: ButtonColor
        }
      }
      input: {
        border: string
        placeholder: string
        hover: {
          border: string
        }
        focus: {
          border: string
        }
      }
      dialog: {
        backdrop: string
        background: string
      }
      popover: {
        backdrop: string
        border: string
        background: string
      }
      alert: {
        success: {
          border: string
          background: string
          icon: string
        }
        warning: {
          border: string
          background: string
          icon: string
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
      divider: string
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
  name: 'light',
  palette,
  color: {
    body: {
      background: palette.white,
      primary: palette.grayNormal,
      secondary: palette.grayLight,
    },
    divider: {
      primary: palette.grayLight0,
      secondary: RGBA(palette.grayLight0, 0.25),
    },
    link: {
      normal: palette.primaryNormal,
      hover: palette.primaryLight,
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
          disabled: {
            border: RGBA(palette.primaryNormal, 0.5),
            background: RGBA(palette.primaryNormal, 0.5),
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
          disabled: {
            border: RGBA(palette.primaryNormal, 0.5),
            background: RGBA(palette.grayLight1, 0.5),
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
          disabled: {
            border: RGBA(palette.grayLight1, 0.5),
            background: RGBA(palette.grayLight1, 0.5),
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
          disabled: {
            border: RGBA(palette.grayLight0, 0.5),
            background: RGBA(palette.grayLight1, 0.5),
            text: palette.grayLight,
          },
        },
      },
      tile: {
        border: palette.grayLight1,
        background: palette.grayLight1,
        text: palette.primaryNormal,
        hover: {
          border: palette.primaryNormal,
          background: palette.grayLight1,
          text: palette.primaryNormal,
        },
      },
    },
    input: {
      border: palette.grayLight0,
      placeholder: palette.grayLight0,
      hover: {
        border: palette.grayLight,
      },
      focus: {
        border: palette.primaryNormal,
      },
    },
    dialog: {
      backdrop: RGBA(palette.grayNormal, 0.9),
      background: palette.grayLight1,
    },
    popover: {
      backdrop: RGBA(palette.grayNormal, 0.9),
      border: palette.grayLight0,
      background: palette.grayLight1,
    },
    alert: {
      success: {
        border: palette.green,
        background: palette.white,
        icon: palette.green,
      },
      warning: {
        border: palette.orange,
        background: palette.white,
        icon: palette.orange,
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
    divider: `0px 2px 0px 0px ${RGBA(palette.grayLight0, 0.25)}`,
    // TODO: wait for design
    shadow: '0px 4px 20px rgba(31, 30, 64, 0.1)',
  },
}

export const darkTheme: Theme = {
  ...lightTheme,
  name: 'dark',
  color: {
    body: {
      background: palette.grayNormal,
      primary: palette.grayLight1,
      secondary: palette.grayLight0,
    },
    divider: {
      primary: palette.grayLight0,
      secondary: RGBA(palette.grayLight0, 0.25),
    },
    link: {
      normal: palette.primaryNormal,
      hover: palette.primaryLight,
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
          disabled: {
            border: RGBA(palette.primaryNormal, 0.5),
            background: RGBA(palette.primaryNormal, 0.5),
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
          disabled: {
            border: RGBA(palette.grayLight, 0.5),
            background: RGBA(palette.grayNormal, 0.5),
            text: palette.grayLight0,
          },
        },
      },
      secondary: {
        contained: {
          border: palette.grayNormal1,
          background: palette.grayNormal1,
          text: palette.grayLight,
          hover: {
            border: palette.grayNormal,
            background: palette.grayNormal,
            text: palette.grayLight,
          },
          disabled: {
            border: RGBA(palette.grayLight1, 0.5),
            background: RGBA(palette.grayLight1, 0.5),
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
          disabled: {
            border: RGBA(palette.grayLight, 0.5),
            background: RGBA(palette.grayNormal, 0.5),
            text: palette.grayLight,
          },
        },
      },
      tile: {
        border: palette.grayNormal1,
        background: palette.grayNormal1,
        text: palette.grayLight1,
        hover: {
          border: palette.grayLight0,
          background: palette.grayNormal1,
          text: palette.grayLight1,
        },
      },
    },
    input: {
      border: palette.grayLight0,
      placeholder: palette.grayLight,
      hover: {
        border: palette.white,
      },
      focus: {
        border: palette.primaryNormal,
      },
    },
    dialog: {
      backdrop: RGBA(palette.grayNormal, 0.9),
      background: palette.grayNormal1,
    },
    popover: {
      backdrop: RGBA(palette.grayNormal, 0.9),
      border: palette.grayLight0,
      background: palette.grayNormal1,
    },
    alert: {
      success: {
        border: palette.green,
        background: palette.white,
        icon: palette.green,
      },
      warning: {
        border: palette.orange,
        background: palette.white,
        icon: palette.orange,
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
  const { user } = useUser()
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
