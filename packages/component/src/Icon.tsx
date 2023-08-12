import { css } from '@emotion/react'
import { useIsMounted } from '@yiwen-ai/util'
import {
  forwardRef,
  memo,
  useEffect,
  useState,
  type ComponentType,
  type SVGAttributes,
} from 'react'
import { useLogger } from './logger'

const SVG_LIST = {
  'archive': () => import('./icon/16/archive.svg'),
  'arrowcircleright': () => import('./icon/24/arrowcircleright.svg'),
  'backwarditem': () => import('./icon/16/backwarditem.svg'),
  'bold': () => import('./icon/format/bold.svg'),
  'brodcast': () => import('./icon/16/brodcast.svg'),
  'celo': () => import('./icon/bulk/celo.svg'),
  'closecircle': () => import('./icon/16/closecircle.svg'),
  'closecircle2': () => import('./icon/24/closecircle.svg'),
  'coin': () => import('./icon/bulk/coin.svg'),
  'delete': () => import('./icon/16/dele.svg'),
  'directright': () => import('./icon/16/directright.svg'),
  'directright2': () => import('./icon/24/directright.svg'),
  'documentcopy': () => import('./icon/16/documentcopy.svg'),
  'dropdown': () => import('./icon/16/dropdown.svg'),
  'edit': () => import('./icon/16/edit.svg'),
  'gallery': () => import('./icon/bulk/gallery.svg'),
  'github': () => import('./icon/provider/github.svg'),
  'google': () => import('./icon/provider/google.svg'),
  'h1': () => import('./icon/format/H1.svg'),
  'h2': () => import('./icon/format/H2.svg'),
  'h3': () => import('./icon/format/H3.svg'),
  'heart': () => import('./icon/16/heart.svg'),
  'heart2': () => import('./icon/16/heart-1.svg'),
  'heart3': () => import('./icon/24/heart.svg'),
  'horizontal': () => import('./icon/format/Underline1.svg'),
  'imgupload': () => import('./icon/16/imgupload.svg'),
  'imgupload2': () => import('./icon/24/imgupload.svg'),
  'importcurve': () => import('./icon/16/importcurve.svg'),
  'italic': () => import('./icon/format/Italic.svg'),
  'lampon': () => import('./icon/bulk/lampon.svg'),
  'link': () => import('./icon/24/link.svg'),
  'messagenotif': () => import('./icon/16/messagenotif.svg'),
  'more': () => import('./icon/16/more.svg'),
  'more2': () => import('./icon/24/more.svg'),
  'notification': () => import('./icon/24/notification.svg'),
  'ol': () => import('./icon/format/Ordered list.svg'),
  'quote': () => import('./icon/format/Ordered list.svg'),
  'recoveryconvert': () => import('./icon/16/recoveryconvert.svg'),
  'refresh': () => import('./icon/16/refresh.svg'),
  'right': () => import('./icon/16/right.svg'),
  'search': () => import('./icon/24/searchnormal1.svg'),
  'tick': () => import('./icon/16/tick.svg'),
  'tickcircle': () => import('./icon/bulk/tickcircle.svg'),
  'translate': () => import('./icon/16/translate.svg'),
  'translate2': () => import('./icon/24/translate.svg'),
  'translate3': () => import('./icon/bulk/translate.svg'),
  'ul': () => import('./icon/format/Unordered list.svg'),
  'underline': () => import('./icon/format/Underline.svg'),
  'upload': () => import('./icon/24/upload.svg'),
  'wanchain': () => import('./icon/16/wanchain1.svg'),
  'warning': () => import('./icon/bulk/warning.svg'),
  'wechat': () => import('./icon/provider/wechat.svg'),
}

export const IconNameList = Object.keys(SVG_LIST) as IconName[]

export type IconName = keyof typeof SVG_LIST

export type IconSize = 'small' | 'medium' | number

const SizeDict: Record<IconSize, number> = {
  small: 16,
  medium: 24,
}

export interface IconProps extends SVGAttributes<SVGSVGElement> {
  /**
   * custom SVG component
   */
  component?: ComponentType<SVGAttributes<SVGSVGElement>>
  /**
   * required if `component` is not provided
   */
  name?: IconName
  /**
   * @default 'medium'
   */
  size?: IconSize
}

export const Icon = memo(
  forwardRef(function Icon(
    { component, name, size = 'medium', tabIndex = -1, ...props }: IconProps,
    ref: React.Ref<SVGSVGElement>
  ) {
    const logger = useLogger()
    const isMounted = useIsMounted()
    const width = typeof size === 'number' ? size : SizeDict[size]
    const [SVG = 'svg', setSVG] = useState<
      ComponentType<SVGAttributes<SVGSVGElement>> | undefined
    >(component)

    useEffect(() => {
      if (typeof SVG === 'function') return
      if (!name) {
        logger.warn('failed to load icon', {
          error: new ReferenceError('name is required'),
        })
        return
      }
      ;(async () => {
        try {
          const { ReactComponent } = await SVG_LIST[name]()
          isMounted() && setSVG(() => ReactComponent)
        } catch (error) {
          logger.error('failed to load icon', { error })
        }
      })()
    }, [SVG, isMounted, logger, name])

    return (
      <SVG
        focusable={tabIndex >= 0}
        tabIndex={tabIndex}
        aria-hidden={!props['aria-label']} // https://css-tricks.com/accessible-svg-icons/#aa-the-icon-is-decorative
        role='img'
        {...props}
        ref={ref}
        css={css`
          flex-shrink: 0;
          width: ${width}px;
          height: ${width}px;
          color: inherit;
          fill: currentColor;
          user-select: none;
        `}
      />
    )
  })
)
