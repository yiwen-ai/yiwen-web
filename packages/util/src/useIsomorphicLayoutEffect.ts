import { useEffect, useLayoutEffect } from 'react' // eslint-disable-line no-restricted-imports

const useIsomorphicLayoutEffect =
  typeof document !== 'undefined' ? useLayoutEffect : useEffect

export { useIsomorphicLayoutEffect as useLayoutEffect }
