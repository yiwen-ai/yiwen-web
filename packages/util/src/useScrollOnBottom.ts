import { debounce } from 'lodash-es'
import { useEffect, useState } from 'react'

export function useScrollOnBottom<T extends HTMLElement>(
  scrollContainerRef: React.RefObject<T>,
  onCall: () => void,
  maxCount = 3
) {
  const [count, setCount] = useState(maxCount)

  useEffect(() => {
    const ele = scrollContainerRef?.current
    // console.log('useScrollOnBottom ref', ref)
    if (ele) {
      const call = debounce(onCall, 618, {
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
      const id =
        ele && ele.clientHeight >= ele.scrollHeight && count > 0
          ? setTimeout(() => {
              if (ele && ele.clientHeight >= ele.scrollHeight && count > 0) {
                // console.log('auto trigger')
                setCount(count - 1)
                call()
              }
            }, 618)
          : null

      return () => {
        ele.removeEventListener('scroll', handler)
        call.cancel()
        id && clearTimeout(id)
      }
    }
    return undefined
  }, [scrollContainerRef, onCall, count, setCount])
}
