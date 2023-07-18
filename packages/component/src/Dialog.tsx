import { css, useTheme } from '@emotion/react'
import { useFloating } from '@floating-ui/react-dom'
import {
  cloneElement,
  memo,
  useCallback,
  useState,
  type HTMLAttributes,
  type ReactElement,
} from 'react'
import { Icon } from '.'
import { Button } from './Button'

interface ClickableProps {
  onClick?: (ev: React.SyntheticEvent) => void
}

export interface DialogProps extends HTMLAttributes<HTMLDivElement> {
  trigger?: ReactElement<ClickableProps> | null
  head?: string | JSX.Element | (() => JSX.Element)
  body?: string | JSX.Element | (() => JSX.Element)
  foot?: string | JSX.Element | (() => JSX.Element)
  defaultIsOpen?: boolean
  onOpen?: () => void
  onClose?: () => void
  onToggle?: (isOpen: boolean) => void
}

export const Dialog = memo(function Dialog({
  trigger,
  head,
  body,
  foot,
  defaultIsOpen,
  onOpen,
  onClose,
  onToggle,
  ...props
}: DialogProps) {
  const theme = useTheme()
  const [isOpen, setIsOpen] = useState(defaultIsOpen ?? false)
  const { refs } = useFloating({ open: isOpen })

  const onClick = trigger?.props.onClick
  const handleOpen = useCallback(
    (ev: React.SyntheticEvent) => {
      onClick?.(ev)
      if (ev.isPropagationStopped()) return
      setIsOpen(true)
      onOpen?.()
      onToggle?.(true)
    },
    [onClick, onOpen, onToggle]
  )

  const handleClose = useCallback(() => {
    setIsOpen(false)
    onClose?.()
    onToggle?.(false)
  }, [onClose, onToggle])

  return (
    <>
      {trigger &&
        cloneElement(trigger, {
          ref: refs.setReference,
          onClick: handleOpen,
        } as ClickableProps)}
      {isOpen && (
        <div
          ref={refs.setFloating}
          css={css`
            position: fixed;
            inset: 0;
            background: ${theme.color.dialog.overlay};
            display: flex;
            flex-direction: column;
            align-items: center;
          `}
        >
          <div
            role='dialog'
            aria-modal='true'
            {...props}
            css={css`
              margin: max(68px, 20%);
              width: 440px;
              background: ${theme.color.dialog.background};
              border-radius: 20px;
              position: relative;
              display: flex;
              flex-direction: column;
            `}
          >
            {typeof head === 'function' ? (
              head()
            ) : head ? (
              <h2
                css={css`
                  padding: 24px;
                  text-align: center;
                `}
              >
                {head}
              </h2>
            ) : null}
            {typeof body === 'function' ? (
              body()
            ) : body ? (
              <div
                css={css`
                  flex: 1;
                  padding: 0 24px;
                  :first-child {
                    padding-top: 24px;
                  }
                  :last-of-type {
                    padding-bottom: 24px;
                  }
                `}
              >
                {body}
              </div>
            ) : (
              props.children
            )}
            {typeof foot === 'function' ? (
              foot()
            ) : foot ? (
              <div
                css={css`
                  padding: 24px;
                  text-align: center;
                `}
              >
                {foot}
              </div>
            ) : null}
            <Button
              shape='circle'
              onClick={handleClose}
              css={css`
                position: absolute;
                top: 16px;
                right: 16px;
              `}
            >
              <Icon name='closecircle' />
            </Button>
          </div>
        </div>
      )}
    </>
  )
})
