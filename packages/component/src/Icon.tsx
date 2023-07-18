import { css } from '@emotion/react'
import { memo, useEffect, useState, type ImgHTMLAttributes } from 'react'
import { usePromise } from 'react-use'
import { useLogger } from './logger'

export type IconName =
  | 'backwarditem'
  | 'closecircle'
  | 'coin'
  | 'delete'
  | 'directright'
  | 'directright2'
  | 'documentcopy'
  | 'edit'
  | 'github'
  | 'google'
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
  | 'wechat'

export type IconSize = 'small' | 'medium' | number

const SizeDict: Record<IconSize, number> = {
  small: 16,
  medium: 24,
}

export interface IconProps extends ImgHTMLAttributes<HTMLImageElement> {
  name: IconName
  /**
   * @default 'medium'
   */
  size?: IconSize
  // TODO: implement
  // color?: 'regular' | 'filled'
}

export const Icon = memo(function Icon({
  name,
  size = 'medium',
  ...props
}: IconProps) {
  const logger = useLogger()
  const mounted = usePromise()
  const width = typeof size === 'number' ? size : SizeDict[size]
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

  return (
    <img
      src={src}
      alt={name}
      aria-hidden={true} // https://css-tricks.com/accessible-svg-icons/#aa-the-icon-is-decorative
      {...props}
      css={css`
        width: ${width}px;
        height: ${width}px;
      `}
    />
  )
})
