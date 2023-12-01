import { debounce } from 'lodash-es'
import { useEffect, useState } from 'react'

export interface ScrollProps<T extends HTMLElement> {
  ref: React.RefObject<T>
  autoTriggerBottomCount: number
  onBottom?: (() => void) | undefined
  onMoveUp?: (() => void) | undefined
  onMoveDown?: (() => void) | undefined
}

export function useScrollOnBottom<T extends HTMLElement>({
  ref,
  autoTriggerBottomCount,
  onBottom,
  onMoveUp,
  onMoveDown,
}: ScrollProps<T>) {
  const [count, setCount] = useState(autoTriggerBottomCount)

  useEffect(() => {
    const ele = ref?.current
    // console.log('useScrollOnBottom ref', ref)
    if (ele) {
      const callBottom =
        onBottom &&
        debounce(onBottom, 618, {
          leading: true,
          trailing: false,
        })

      const callMoveUp =
        onMoveUp &&
        debounce(onMoveUp, 618, {
          leading: true,
          trailing: false,
        })

      const callMoveDown =
        onMoveDown &&
        debounce(onMoveDown, 618, {
          leading: true,
          trailing: false,
        })

      let lastScrollTop = 0
      const handler = (ev: Event) => {
        const target = ev.currentTarget as HTMLElement
        if (target.scrollTop > lastScrollTop) {
          callMoveUp && callMoveUp()
        } else {
          callMoveDown && callMoveDown()
        }

        if (
          target &&
          target.clientHeight + target.scrollTop + 5 >= target.scrollHeight
        ) {
          // console.log('scroll trigger')
          callBottom && callBottom()
        }

        lastScrollTop = target.scrollTop
      }

      ele.addEventListener('scroll', handler)

      // auto trigger if the content is not overflow
      const id =
        ele && ele.clientHeight >= ele.scrollHeight && count > 0
          ? setTimeout(() => {
              if (ele && ele.clientHeight >= ele.scrollHeight && count > 0) {
                // console.log('auto trigger')
                setCount(count - 1)
                callBottom && callBottom()
              }
            }, 618)
          : null

      return () => {
        ele.removeEventListener('scroll', handler)
        callBottom && callBottom.cancel()
        id && clearTimeout(id)
      }
    }
    return undefined
  }, [ref, onBottom, onMoveUp, onMoveDown, count, setCount])
}
