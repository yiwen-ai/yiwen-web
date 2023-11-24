import { debounce } from 'lodash-es'
import { useEffect } from 'react'

export function useScrollOnBottom<T extends HTMLElement>(
  scrollContainerRef: React.RefObject<T>,
  onCall: () => void
) {
  useEffect(() => {
    const ele = scrollContainerRef?.current
    // console.log('useScrollOnBottom ref', ref)
    if (ele) {
      const call = debounce(onCall, 600, {
        leading: true,
        trailing: false,
      })

      const handler = (ev: Event) => {
        const target = ev.currentTarget as HTMLElement
        if (
          target &&
          target.clientHeight + target.scrollTop === target.scrollHeight
        ) {
          // console.log('scroll trigger')
          call()
        }
      }
      ele.addEventListener('scroll', handler)

      // auto trigger if the content is not overflow
      const id = setTimeout(() => {
        if (ele && ele.clientHeight >= ele.scrollHeight) {
          // console.log('auto trigger')
          call()
        }
      }, 600)

      return () => {
        ele.removeEventListener('scroll', handler)
        call.cancel()
        clearTimeout(id)
      }
    }
    return undefined
  }, [scrollContainerRef, onCall])
}
