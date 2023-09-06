export function preventDefault(ev: Event | React.SyntheticEvent) {
  ev.preventDefault()
}

export function stopPropagation(ev: Event | React.SyntheticEvent) {
  ev.stopPropagation()
}

export function preventDefaultStopPropagation(
  ev: Event | React.SyntheticEvent
) {
  ev.preventDefault()
  ev.stopPropagation()
}
