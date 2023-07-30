import { memo, type PropsWithChildren } from 'react'
import { createPortal } from 'react-dom'

export interface PortalProps {
  container?:
    | (() => HTMLElement | null | undefined)
    | React.RefObject<HTMLElement>
    | undefined
}

export const Portal = memo(function Portal({
  container,
  ...props
}: PropsWithChildren<PortalProps>) {
  const el = typeof container === 'function' ? container() : container?.current
  return createPortal(props.children, el ?? document.body)
})
