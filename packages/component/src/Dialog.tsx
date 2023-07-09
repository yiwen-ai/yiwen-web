import { css } from '@emotion/react'
import { useFloating } from '@floating-ui/react-dom'
import { toRGBA } from '@yiwen-ai/util'
import {
  cloneElement,
  memo,
  useCallback,
  useState,
  type ReactElement,
} from 'react'
import { lightTheme } from './theme'

interface ClickableProps {
  onClick?: (ev: React.SyntheticEvent) => void
}

export interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {
  trigger?: ReactElement<ClickableProps> | null
  defaultIsOpen?: boolean
  onOpen?: () => void
  onClose?: () => void
  onToggle?: (isOpen: boolean) => void
}

export const Dialog = memo(function Dialog({
  trigger,
  defaultIsOpen,
  onOpen,
  onClose,
  onToggle,
  ...props
}: DialogProps) {
  const theme = lightTheme // use light theme for dialog
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
          {...props}
          ref={refs.setFloating}
          css={css`
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            padding: max(68px, 20%);
            /* TODO: use correct color */
            background: ${toRGBA('#000', 0.75)};
            display: flex;
            flex-direction: column;
            align-items: center;
          `}
        >
          <div
            css={css`
              width: 440px;
              padding: 16px;
              background: ${theme.color.background};
              color: ${theme.color.text};
              border-radius: 4px;
              position: relative;
            `}
          >
            {props.children}
            <button
              onClick={handleClose}
              css={css`
                position: absolute;
                top: 16px;
                right: 16px;
              `}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
})
