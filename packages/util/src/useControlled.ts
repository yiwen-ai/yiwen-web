import { useCallback, useRef, useState } from 'react'

export function useControlled<T>(options: {
  defaultValue: T
  value: T | undefined
  onChange: ((value: T) => void) | undefined
}): readonly [T, (value: T) => void]

export function useControlled<T>(options: {
  defaultValue: T | undefined
  value: T | undefined
  onChange: ((value: T) => void) | undefined
}): readonly [T | undefined, (value: T) => void]

export function useControlled<T>({
  defaultValue,
  value,
  onChange: _onChange,
}: {
  defaultValue: T | undefined
  value: T | undefined
  onChange: ((value: T) => void) | undefined
}) {
  const valueRef = useRef(value)
  valueRef.current = value

  const onChange = useCallback(
    (value: T) => {
      if (value !== valueRef.current) {
        _onChange?.(value)
      }
    },
    [_onChange]
  )

  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue)
  const uncontrolledValueRef = useRef(uncontrolledValue)
  uncontrolledValueRef.current = uncontrolledValue

  const updateUncontrolledValue = useCallback(
    (value: T) => {
      if (value !== uncontrolledValueRef.current) {
        setUncontrolledValue(value)
        _onChange?.(value)
      }
    },
    [_onChange]
  )

  return [
    value !== undefined ? value : uncontrolledValue,
    value !== undefined ? onChange : updateUncontrolledValue,
  ] as const
}
