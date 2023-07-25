import { useCallback, useState } from 'react'

const handleChange = () => undefined

export function useControlled<T>({
  defaultValue,
  value,
  onChange = handleChange,
}: {
  defaultValue: T
  value: T | undefined
  onChange: ((value: T) => void) | undefined
}) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue)
  const updateUncontrolledValue = useCallback(
    (value: T) => {
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
