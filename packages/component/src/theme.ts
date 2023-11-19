import { type CSSObject, type Theme } from '@emotion/react'
import { type ColorScheme } from '@yiwen-ai/store'
import { RGBA } from '@yiwen-ai/util'
import { useCallback, useEffect, useMemo, useState } from 'react'

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

interface AlertColor {
  border: string
  background: string
  icon: string
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
        default: string
        secondary: string
        primary: string
        primaryHover: string
        danger: string
      }
      divider: {
        default: string
        secondary: string
      }
      button: {
        primary: {
          contained: Button
          outlined: Button
          text: Button
        }
        secondary: {
          contained: Button
          outlined: Button
          text: Button
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
        success: AlertColor
        warning: AlertColor
      }
      menu: {
        border: string
        background: string
        item: {
          hover: {
            background: string
          }
        }
        group: {
          text: string
        }
      }
      tab: {
        background: string
        text: string
        hover: {
          background: string
          text: string
        }
        active: {
          background: string
          text: string
          indicator: string
        }
      }
      code: {
        background: string
      }
      codeBlock: {
        color: string
        background: string
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
      h0: Typography
      h1: Typography
      h2: Typography
      body: Typography
      bodyBold: Typography
      tooltip: Typography
    }
    /**
     * effect
     */
    effect: {
      divider: string
      card: string
      cardHover: string
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
  grayLight0: '#E4E4EF',
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
      default: palette.grayNormal,
      secondary: palette.grayLight,
      primary: palette.primaryNormal,
      primaryHover: palette.primaryLight,
      danger: palette.orange,
    },
    divider: {
      default: palette.grayLight0,
      secondary: RGBA(palette.grayLight0, 0.25),
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
          border: RGBA(palette.primaryNormal, 0.75),
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
        text: {
          border: 'transparent',
          background: '',
          text: palette.primaryNormal,
          hover: {
            border: 'transparent',
            background: palette.grayLight1,
            text: palette.primaryNormal,
          },
          disabled: {
            border: 'transparent',
            background: '',
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
        text: {
          border: 'transparent',
          background: '',
          text: palette.grayLight,
          hover: {
            border: 'transparent',
            background: palette.grayLight1,
            text: palette.grayLight,
          },
          disabled: {
            border: 'transparent',
            background: '',
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
        background: palette.grayLight1,
        icon: palette.green,
      },
      warning: {
        border: palette.orange,
        background: palette.grayLight1,
        icon: palette.orange,
      },
    },
    menu: {
      border: palette.grayLight0,
      background: palette.white,
      item: {
        hover: {
          background: palette.grayLight1,
        },
      },
      group: {
        text: palette.primaryNormal,
      },
    },
    tab: {
      background: palette.white,
      text: palette.grayLight,
      hover: {
        background: palette.grayLight1,
        text: '',
      },
      active: {
        background: palette.white,
        text: palette.primaryNormal,
        indicator: palette.primaryNormal,
      },
    },
    code: {
      background: palette.grayLight0,
    },
    codeBlock: {
      color: palette.grayLight1,
      background: palette.grayNormal,
    },
  },
  font: {
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
    code: '"SFMono-Regular", "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
  },
  typography: {
    h0: {
      fontSize: '42px',
      fontWeight: 600,
      lineHeight: '60px',
    },
    h1: {
      fontSize: '28px',
      fontWeight: 400,
      lineHeight: '40px',
    },
    h2: {
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
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: '20px',
    },
  },
  effect: {
    divider: `0px 0px 3px 2px ${RGBA(palette.grayLight0, 0.75)}`,
    card: `0px 0px 3px 2px ${RGBA(palette.grayLight0, 0.75)}`,
    cardHover: `0px 0px 4px 2px ${RGBA(palette.primaryLight, 0.5)}`,
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
      default: palette.grayLight1,
      secondary: palette.grayLight0,
      primary: palette.primaryNormal,
      primaryHover: palette.primaryLight,
      danger: palette.orange,
    },
    divider: {
      default: RGBA(palette.grayLight, 0.75),
      secondary: RGBA(palette.grayLight0, 0.25),
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
          border: RGBA(palette.grayLight0, 0.75),
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
        text: {
          border: 'transparent',
          background: '',
          text: palette.grayLight0,
          hover: {
            border: 'transparent',
            background: palette.grayNormal1,
            text: palette.grayLight1,
          },
          disabled: {
            border: 'transparent',
            background: '',
            text: palette.grayLight,
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
        text: {
          border: 'transparent',
          background: '',
          text: palette.grayLight,
          hover: {
            border: 'transparent',
            background: palette.grayNormal1,
            text: palette.grayLight,
          },
          disabled: {
            border: 'transparent',
            background: '',
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
        background: palette.grayNormal1,
        icon: palette.green,
      },
      warning: {
        border: palette.orange,
        background: palette.grayNormal1,
        icon: palette.orange,
      },
    },
    menu: {
      border: palette.grayLight0,
      background: palette.grayNormal,
      item: {
        hover: {
          background: palette.grayNormal1,
        },
      },
      group: {
        text: palette.grayLight0,
      },
    },
    tab: {
      background: palette.grayNormal,
      text: palette.grayLight0,
      hover: {
        background: palette.grayNormal1,
        text: '',
      },
      active: {
        background: palette.grayNormal,
        text: palette.primaryNormal,
        indicator: palette.primaryNormal,
      },
    },
    code: {
      background: palette.grayLight,
    },
    codeBlock: {
      color: palette.grayLight1,
      background: palette.grayNormal,
    },
  },
}

const useIsDarkMode = () => {
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
  const darkMode = useIsDarkMode()
  const [theme, setTheme] = useState(darkMode ? darkTheme : lightTheme)

  const switchTheme = useCallback(() => {
    setTheme((prev) => (prev.name === 'light' ? darkTheme : lightTheme))
    return undefined
  }, [])

  return {
    theme,
    switchTheme,
  } as const
}
