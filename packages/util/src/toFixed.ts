export function toFixed(value: number, precision: number) {
  const multiplier = Math.pow(10, precision)
  return Math.round(value * multiplier) / multiplier
}

export function currencyFormatter(value: number, precision: number) {
  return value.toFixed(precision)
}
