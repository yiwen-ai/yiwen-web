/// <reference types="vite/client" />

declare module '*.svg' {
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & {
      title?: string | undefined
      titleId?: string | undefined
    }
  >
}
