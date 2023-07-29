import { css, useTheme } from '@emotion/react'
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
  type Placement,
} from '@floating-ui/react-dom'
import {
  pickModalProps,
  useModal,
  type AnchorProps,
  type ModalProps,
  type ModalRef,
} from '@yiwen-ai/util'
import { omit, pick } from 'lodash-es'
import {
  forwardRef,
  memo,
  useImperativeHandle,
  type HTMLAttributes,
} from 'react'
import { Portal, type PortalProps } from './Portal'

export interface PopoverProps extends ModalProps {
  anchor?: (props: AnchorProps) => JSX.Element
  container?: PortalProps['container']
  placement?: Placement | undefined
}

export const Popover = memo(
  forwardRef(function Popover(
    {
      anchor,
      container,
      placement,
      ...props
    }: PopoverProps & HTMLAttributes<HTMLDivElement>,
    ref: React.Ref<ModalRef>
  ) {
    const theme = useTheme()
    const {
      open,
      modal,
      anchorProps,
      floatingProps,
      mergeAnchorRef,
      mergeFloatingRef,
    } = useModal(props)
    useImperativeHandle(ref, () => modal, [modal])
    const { refs, floatingStyles } = useFloating({
      placement: placement as Placement,
      open,
      middleware: [offset(8), flip(), shift()],
      whileElementsMounted: autoUpdate,
    })
    const setAnchorRef = mergeAnchorRef(refs.setReference)
    const setFloatingRef = mergeFloatingRef(refs.setFloating)

    return (
      <>
        {anchor?.({ ...anchorProps, ref: setAnchorRef })}
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

// eslint-disable-next-line react-refresh/only-export-components
export function pickPopoverProps<P extends PopoverProps>(props: P) {
  const { modalProps, restProps } = pickModalProps(props)
  const keys: (keyof PopoverProps)[] = ['anchor', 'container', 'placement']

  return {
    popoverProps: { ...modalProps, ...pick(restProps, keys) } as PopoverProps,
    restProps: omit(restProps, keys) as Omit<P, keyof PopoverProps>,
  }
}
