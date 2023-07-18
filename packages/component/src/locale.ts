import { createElement, useState } from 'react'
import { IntlProvider, type IntlConfig } from 'react-intl'

export const DEFAULT_LOCALE = 'zh-CN'

interface LocaleProviderProps
  extends Omit<IntlConfig, 'messages' | 'defaultLocale'> {}

export function LocaleProvider({
  locale,
  ...props
}: React.PropsWithChildren<LocaleProviderProps>) {
  // TODO: load messages based on locale
  const [messages] = useState({})

  return createElement(IntlProvider, {
    messages,
    locale,
    defaultLocale: DEFAULT_LOCALE,
    ...props,
  })
}
