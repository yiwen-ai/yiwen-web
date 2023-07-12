export function isWindow(target: unknown): target is Window {
  return (
    typeof target === 'object' &&
    target !== null &&
    'self' in target &&
    'window' in target &&
    target.self === target &&
    target.window === target
  )
}
