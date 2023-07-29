import { omit, pick } from 'lodash-es'
import type React from 'react'
import { useCallback, useMemo, useRef, type HTMLAttributes } from 'react'
import { useControlled } from './useControlled'
import { useLayoutEffect } from './useIsomorphicLayoutEffect'

type Prettify<T> = { [K in keyof T]: T[K] } & unknown

export interface AnchorProps {
  ref: React.RefCallback<HTMLElement>
  onPointerUpCapture: React.PointerEventHandler<HTMLElement>
  onClick: React.MouseEventHandler<HTMLElement>
  onKeyDown: React.KeyboardEventHandler<HTMLElement>
}

export interface FloatingProps<T extends HTMLElement> {
  ref: React.RefCallback<T>
  onPointerUpCapture: React.PointerEventHandler<T>
  onKeyDown: React.KeyboardEventHandler<T>
}

export interface ModalProps {
  defaultOpen?: boolean | undefined
  open?: boolean | undefined
  onToggle?: (open: boolean) => void
  onShow?: () => void
  onClose?: () => void
}

export interface ModalRef {
  show: () => void
  close: () => void
  toggle: () => void
}

export function useModal<T extends HTMLElement, U extends HTMLAttributes<T>>({
  defaultOpen = false,
  open: _open,
  onToggle,
  onShow,
  onClose,
  onPointerUpCapture,
  onKeyDown,
  ...props
}: ModalProps & HTMLAttributes<T> & U) {
  const [open, setOpen] = useControlled({
    defaultValue: defaultOpen,
    value: _open,
    onChange: onToggle,
  })
  const openRef = useRef(open)
  openRef.current = open

  //#region modal
  const show = useCallback(() => {
    if (openRef.current) return
    setOpen(true)
    onShow?.()
  }, [onShow, setOpen])

  const close = useCallback(() => {
    if (!openRef.current) return
    setOpen(false)
    onClose?.()
    anchorRef.current?.focus() // bring focus back to anchor
  }, [onClose, setOpen])

  const toggle = useCallback(() => {
    openRef.current ? close() : show()
  }, [close, show])

  const modal = useMemo<ModalRef>(
    () => ({ show, close, toggle }),
    [close, show, toggle]
  )
  //#endregion

  //#region toggle on clicking anchor
  const anchorRef = useRef<HTMLElement | null>(null)

  const setAnchorRef = useCallback((el: HTMLElement | null) => {
    anchorRef.current = el
  }, [])

  const handleClick = useCallback<AnchorProps['onClick']>(
    (ev) => {
      if (ev.isPropagationStopped()) return
      toggle()
      anchorRef.current = ev.currentTarget
    },
    [toggle]
  )
  //#endregion

  //#region dismiss on pressing Escape
  const handleKeyDown = useCallback(
    (ev: React.KeyboardEvent | KeyboardEvent) => {
      if (
        openRef.current &&
        ev.key === 'Escape' &&
        !(ev as React.KeyboardEvent).isPropagationStopped?.()
      ) {
        ev.stopPropagation()
        close()
      }
    },
    [close]
  )

  useLayoutEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
  //#endregion

  //#region dismiss on clicking outside
  const floatingRef = useRef<T | null>(null)

  const setFloatingRef = useCallback((el: T | null) => {
    floatingRef.current = el
  }, [])

  const stoppedPointerUpEvent = useRef<PointerEvent>() // pointerup event whose propagation has been stopped

  const handlePointerUpCapture = useCallback((ev: React.PointerEvent<T>) => {
    if (openRef.current && !ev.isPropagationStopped()) {
      stoppedPointerUpEvent.current = ev.nativeEvent // flag this event as stopped
    }
  }, [])

  useLayoutEffect(() => {
    const handlePointerUp = (ev: PointerEvent) => {
      const stoppedEv = stoppedPointerUpEvent.current
      stoppedPointerUpEvent.current = undefined
      if (stoppedEv && isSameEvent(ev, stoppedEv)) return // inside floating (virtual/React) DOM tree
      if (floatingRef.current?.contains(ev.target as Node)) return // inside floating (physical) DOM tree
      if (openRef.current) {
        close()
      }
    }
    document.addEventListener('pointerup', handlePointerUp)
    return () => document.removeEventListener('pointerup', handlePointerUp)
  }, [close])
  //#endregion

  //#region anchor and floating props
  const anchorProps: AnchorProps = {
    ref: setAnchorRef,
    onPointerUpCapture: handlePointerUpCapture,
    onClick: handleClick,
    onKeyDown: handleKeyDown,
  }

  const floatingProps: Prettify<FloatingProps<T> & typeof props> = {
    ...props,
    ref: setFloatingRef,
    onPointerUpCapture: useCallback(
      (ev) => {
        onPointerUpCapture?.(ev)
        handlePointerUpCapture(ev)
      },
      [handlePointerUpCapture, onPointerUpCapture]
    ),
    onKeyDown: useCallback(
      (ev) => {
        onKeyDown?.(ev)
        handleKeyDown(ev)
      },
      [handleKeyDown, onKeyDown]
    ),
  }

  const mergeAnchorRef = useCallback(
    (ref: React.ForwardedRef<HTMLElement>) => (el: HTMLElement | null) => {
      setAnchorRef(el)
      if (ref) typeof ref === 'function' ? ref(el) : (ref.current = el)
    },
    [setAnchorRef]
  )

  const mergeFloatingRef = useCallback(
    (ref: React.ForwardedRef<T>) => (el: T | null) => {
      setFloatingRef(el)
      if (ref) typeof ref === 'function' ? ref(el) : (ref.current = el)
    },
    [setFloatingRef]
  )
  //#endregion

  return {
    open,
    modal,
    anchorProps,
    floatingProps,
    mergeAnchorRef,
    mergeFloatingRef,
  }
}

function isSameEvent(a: Event, b: Event) {
  return (
    a.target === b.target &&
    a.timeStamp === b.timeStamp &&
    a.type === b.type &&
    a.isTrusted === b.isTrusted
  )
}

export function pickModalProps<P extends ModalProps>(props: P) {
  const keys: (keyof ModalProps)[] = [
    'defaultOpen',
    'open',
    'onToggle',
    'onShow',
    'onClose',
  ]

  return {
    modalProps: pick(props, keys) as ModalProps,
    restProps: omit(props, keys),
  }
}
