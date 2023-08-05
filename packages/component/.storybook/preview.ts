import { withThemeFromJSXProvider } from '@storybook/addon-styling'
import { Decorator, type Preview } from '@storybook/react'
import { createElement } from 'react'
import {
  DEFAULT_LOCALE,
  GlobalStyles,
  LocaleProvider,
  ThemeProvider,
} from '../src'
import { darkTheme, lightTheme } from '../src/theme'

const withLocale: Decorator = (Story) =>
  createElement(LocaleProvider, { locale: DEFAULT_LOCALE }, Story())

const preview: Preview = {
  parameters: {
    // TODO: https://github.com/storybookjs/storybook/issues/15012
    actions: { argTypesRegex: '^on[A-Z].*' },
  },
  decorators: [
    withThemeFromJSXProvider({
      themes: { light: lightTheme, dark: darkTheme },
      defaultTheme: 'light',
      Provider: ThemeProvider,
      GlobalStyles,
    }),
    withLocale,
  ],
}

export default preview
