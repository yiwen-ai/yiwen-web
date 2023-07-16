import { memo, useEffect, useState } from 'react'
import { usePromise } from 'react-use'
import { useLogger } from './logger'

type IconName =
  | 'backwarditem'
  | 'coin'
  | 'delete'
  | 'directright'
  | 'directright2'
  | 'documentcopy'
  | 'edit'
  | 'heart'
  | 'heart2'
  | 'heart3'
  | 'importcurve'
  | 'lampon'
  | 'messagenotif'
  | 'more'
  | 'more2'
  | 'refresh'
  | 'search'
  | 'translate'
  | 'translate2'
  | 'translate3'
  | 'wanchain1'

export interface IconProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  name: IconName
  // TODO: implement
  // size?: 'small' | 'medium' | 'large'
  // color?: 'regular' | 'filled'
}

export const Icon = memo(function Icon({ name, ...props }: IconProps) {
  const logger = useLogger()
  const mounted = usePromise()
  const [src, setSrc] = useState<string | undefined>()

  useEffect(() => {
    ;(async () => {
      try {
        const { default: src } = await mounted(
          import(`./icon/${name}.svg`) as Promise<{ default: string }>
        )
        setSrc(src)
      } catch (error) {
        logger.error('failed to load icon', { error })
      }
    })()
  }, [logger, mounted, name])

  return <img aria-describedby="icon" src={src} alt={name} {...props} />
})
