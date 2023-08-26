import { BREAKPOINT } from '#/shared'
import { css, useTheme } from '@emotion/react'
import {
  Dialog,
  DialogBody,
  DialogClose,
  type DialogProps,
} from '@yiwen-ai/component'
import { RGBA } from '@yiwen-ai/util'

interface LargeDialogProps extends DialogProps {}

export default function LargeDialog({
  title,
  children,
  ...props
}: LargeDialogProps) {
  const theme = useTheme()

  return (
    <Dialog
      {...props}
      css={css`
        width: unset;
        height: unset;
        max-width: unset;
        max-height: unset;
        margin: 96px 80px 0;
        border-bottom-left-radius: unset;
        border-bottom-right-radius: unset;
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
      `}
    >
      <DialogBody
        css={css`
          padding: unset;
          display: flex;
          flex-direction: column;
        `}
      >
        {children}
      </DialogBody>
      <DialogClose
        css={css`
          color: ${RGBA(theme.palette.white, 0.4)};
          :hover {
            background-color: ${RGBA(theme.palette.grayLight1, 0.1)};
          }
          @media (max-width: ${BREAKPOINT.large}px) {
            position: fixed;
            top: 48px;
            right: 32px;
          }
          @media (min-width: ${BREAKPOINT.large}px) {
            position: absolute;
            inset: unset;
            left: 100%;
            bottom: 100%;
            margin-left: 16px;
            margin-bottom: 16px;
          }
        `}
      />
    </Dialog>
  )
}
