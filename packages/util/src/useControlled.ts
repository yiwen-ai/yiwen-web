import { useCallback, useRef, useState } from 'react'

const handleChange = () => undefined

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
  onChange = handleChange,
}: {
  defaultValue: T | undefined
  value: T | undefined
  onChange: ((value: T) => void) | undefined
}) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue)
  const uncontrolledValueRef = useRef(uncontrolledValue)
  uncontrolledValueRef.current = uncontrolledValue
  const updateUncontrolledValue = useCallback(
    (value: T) => {
      if (value === uncontrolledValueRef.current) return
      setUncontrolledValue(value)
      onChange(value)
    },
    [onChange]
  )
  return [
    value !== undefined ? value : uncontrolledValue,
    value !== undefined ? onChange : updateUncontrolledValue,
  ] as const
}
