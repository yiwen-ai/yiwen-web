import { BREAKPOINT } from '#/shared'
import { css, useTheme } from '@emotion/react'
import { Dialog, DialogBody, type DialogProps } from '@yiwen-ai/component'
import { createContext, useCallback, useRef, useState } from 'react'

interface LargeDialogProps extends DialogProps {}

export const LargeDialogContext = createContext((_: boolean) => undefined)
export const LargeDialogBodyRefContext =
  createContext<React.RefObject<HTMLElement> | null>(null)

export default function LargeDialog({
  title,
  children,
  ...props
}: LargeDialogProps) {
  const theme = useTheme()
  const [fullScreen, setFullScreen] = useState(false)
  const switchFullScreen = useCallback(
    (v: boolean) => {
      setFullScreen(v)
      return undefined
    },
    [setFullScreen]
  )
  const dialogBodyRef = useRef<HTMLDivElement>(null)

  return (
    <LargeDialogContext.Provider value={switchFullScreen}>
      <Dialog
        {...props}
        css={css`
          width: unset;
          height: unset;
          max-width: unset;
          max-height: unset;
          margin: 36px 80px 0;
          border-bottom-left-radius: unset;
          border-bottom-right-radius: unset;
          background-color: ${theme.color.body.background};
          transition: max-width 0.4s ease-in-out;
          @media (max-width: ${BREAKPOINT.small}px) {
            margin-top: 0;
            border-radius: unset;
          }
          @media (max-width: ${BREAKPOINT.medium}px) {
            max-width: 800px;
            margin-left: auto;
            margin-right: auto;
          }
          @media (min-width: ${BREAKPOINT.large}px) {
            max-width: 1280px;
            margin-left: auto;
            margin-right: auto;
          }
          ${fullScreen &&
          css`
            max-width: 100% !important;
          `}
        `}
      >
        <DialogBody
          ref={dialogBodyRef}
          css={css`
            padding: unset;
            display: flex;
            flex-direction: column;
          `}
        >
          <LargeDialogBodyRefContext.Provider value={dialogBodyRef}>
            {children}
          </LargeDialogBodyRefContext.Provider>
        </DialogBody>
      </Dialog>
    </LargeDialogContext.Provider>
  )
}
