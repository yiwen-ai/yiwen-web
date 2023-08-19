import { css, useTheme } from '@emotion/react'
import {
  autoUpdate,
  flip,
  offset,
  shift,
  size,
  useFloating,
  type Middleware,
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
  useMemo,
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
      middleware: useMemo<Middleware[]>(
        () => [
          offset({
            mainAxis: 8,
          }),
          shift({
            padding: 8,
          }),
          flip(),
          size({
            padding: 8,
            apply: ({ availableWidth, availableHeight, elements }) => {
              elements.floating.style.maxWidth = `${availableWidth}px`
              elements.floating.style.maxHeight = `${availableHeight}px`
            },
          }),
        ],
        []
      ),
      whileElementsMounted: autoUpdate,
    })
    const setAnchorRef = useMemo(
      () => mergeAnchorRef(refs.setReference),
      [mergeAnchorRef, refs.setReference]
    )
    const setFloatingRef = useMemo(
      () => mergeFloatingRef(refs.setFloating),
      [mergeFloatingRef, refs.setFloating]
    )

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
                box-sizing: border-box;
                border-radius: 12px;
                border: 1px solid ${theme.color.popover.border};
                background: ${theme.color.popover.background};
                overflow-y: auto;
                z-index: 1;
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
