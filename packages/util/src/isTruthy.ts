export function isTruthy<T>(
  value: T | null | undefined | false | 0 | 0n | '' | typeof NaN
): value is T {
  return Boolean(value)
}
