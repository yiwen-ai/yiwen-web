import { css } from '@emotion/react'
import { forwardRef, memo, useMemo } from 'react'
import { Dialog, type DialogProps, type DialogRef } from './Dialog'

export interface AlertDialogProps extends DialogProps {}

export const AlertDialog = memo(
  forwardRef(function AlertDialog(
    { head, body, ...props }: AlertDialogProps,
    ref: React.Ref<DialogRef>
  ) {
    const renderHead = useMemo(() => {
      if (typeof head === 'function') return head
      if (!head) return null
      // eslint-disable-next-line react/display-name
      return () => (
        <div
          data-dialog-head={true}
          role='heading'
          aria-level={2}
          css={css`
            padding: 24px;
            text-align: center;
          `}
        >
          {head}
        </div>
      )
    }, [head])

    const renderBody = useMemo(() => {
      if (typeof body === 'function') return body
      if (!body) return null
      // eslint-disable-next-line react/display-name
      return () => (
        <div
          data-dialog-body={true}
          css={css`
            padding: 0 24px;
            text-align: center;
            :first-of-type {
              padding-top: 24px;
            }
            :last-of-type {
              padding-bottom: 24px;
            }
          `}
        >
          {body}
        </div>
      )
    }, [body])

    return (
      <Dialog
        role='alertdialog'
        head={renderHead}
        body={renderBody}
        {...props}
        ref={ref}
        css={css`
          width: 440px;
          height: fit-content;
          margin: auto;
          border-radius: 20px;
          > button:last-child {
            inset: unset;
            top: 16px;
            right: 16px;
            margin: unset;
          }
        `}
      />
    )
  })
)
