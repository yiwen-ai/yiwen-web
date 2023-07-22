import hexRgb from 'hex-rgb'

export function RGBA(hex: string, alpha = 1) {
  const rgb = hexRgb(hex)
  return `rgba(${rgb.red}, ${rgb.green}, ${rgb.blue}, ${alpha})`
}
