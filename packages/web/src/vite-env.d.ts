/// <reference types="vite/client" />

declare module '*.svg' {
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & {
      title?: string | undefined
      titleId?: string | undefined
    }
  >
}

interface ImportMetaEnv {
  readonly VITE_PUBLIC_PATH: string
  readonly VITE_API_URL: string
  readonly VITE_AUTH_URL: string
  readonly VITE_SHARE_URL: string
  readonly VITE_WALLET_URL: string
}
