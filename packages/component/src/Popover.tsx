import { css, useTheme } from '@emotion/react'
import {
  autoPlacement,
  autoUpdate,
  offset,
  shift,
  useFloating,
  type Placement,
} from '@floating-ui/react-dom'
import {
  useModal,
  type ModalProps,
  type ModalRef,
  type TriggerProps,
} from '@yiwen-ai/util'
import {
  forwardRef,
  memo,
  useImperativeHandle,
  type HTMLAttributes,
} from 'react'
import { Portal, type PortalProps } from './Portal'

export interface PopoverProps
  extends HTMLAttributes<HTMLDivElement>,
    ModalProps {
  trigger?: (props: TriggerProps) => JSX.Element
  container?: PortalProps['container']
  placement?: Placement
}

export const Popover = memo(
  forwardRef(function Popover(
    { trigger, container, placement, ...props }: PopoverProps,
    ref: React.Ref<ModalRef>
  ) {
    const theme = useTheme()
    const {
      open,
      modal,
      triggerProps,
      floatingProps,
      mergeTriggerRef,
      mergeFloatingRef,
    } = useModal(props)
    useImperativeHandle(ref, () => modal, [modal])
    const { refs, floatingStyles } = useFloating({
      placement: placement as Placement,
      open,
      middleware: [offset(8), autoPlacement(), shift()],
      whileElementsMounted: autoUpdate,
    })
    const setTriggerRef = mergeTriggerRef(refs.setReference)
    const setFloatingRef = mergeFloatingRef(refs.setFloating)

    return (
      <>
        {trigger?.({ ...triggerProps, ref: setTriggerRef })}
        {open && (
          <Portal container={container}>
            <div
              role='dialog'
              aria-modal='false'
              tabIndex={-1}
              {...floatingProps}
              ref={setFloatingRef}
              style={{ ...floatingStyles, ...floatingProps.style }}
              css={css`
                padding: 24px;
                border-radius: 12px;
                border: 1px solid ${theme.color.popover.border};
                background: ${theme.color.popover.background};
              `}
            />
          </Portal>
        )}
      </>
    )
  })
)
