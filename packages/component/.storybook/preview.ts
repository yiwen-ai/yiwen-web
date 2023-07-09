import { withThemeFromJSXProvider } from '@storybook/addon-styling'
import { type Preview } from '@storybook/react'
import { withRouter } from 'storybook-addon-react-router-v6'
import { GlobalStyles, ThemeProvider } from '../src'
import { darkTheme, lightTheme } from '../src/theme'

const preview: Preview = {
  parameters: {
    // TODO: https://github.com/storybookjs/storybook/issues/15012
    actions: { argTypesRegex: '^on[A-Z].*' },
  },
  decorators: [
    withRouter,
    withThemeFromJSXProvider({
      themes: { light: lightTheme, dark: darkTheme },
      defaultTheme: 'light',
      Provider: ThemeProvider,
      GlobalStyles,
    }),
  ],
}

export default preview
