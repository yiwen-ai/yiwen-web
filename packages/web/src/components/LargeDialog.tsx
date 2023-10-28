import { BREAKPOINT } from '#/shared'
import { css, useTheme } from '@emotion/react'
import { Dialog, DialogBody, type DialogProps } from '@yiwen-ai/component'

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
        margin: 36px 80px 0;
        border-bottom-left-radius: unset;
        border-bottom-right-radius: unset;
        background-color: ${theme.color.body.background};
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
    </Dialog>
  )
}
