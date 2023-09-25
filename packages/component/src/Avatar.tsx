import { css, useTheme } from '@emotion/react'
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useState,
  type HTMLAttributes,
} from 'react'
import { textEllipsis } from './common'
import { useLogger } from './logger'

export type AvatarSize = 'small' | 'medium'

const SizeDict: Record<AvatarSize, number> = {
  small: 24,
  medium: 36,
}

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * the avatar image URL
   */
  src: string | null | undefined
  /**
   * not required if `name` is provided
   */
  alt?: string
  /**
   * optional name to display
   */
  name?: string
  /**
   * optional name to display
   */
  cn?: string
  size?: AvatarSize | number
}

export const Avatar = memo(
  forwardRef(function Avatar(
    { src, alt, name, cn, size = 'medium', ...props }: AvatarProps,
    ref: React.Ref<HTMLDivElement>
  ) {
    const width = typeof size === 'number' ? size : SizeDict[size]
    const logger = useLogger()
    const theme = useTheme()

    useEffect(() => {
      if (!name && !alt) {
        logger.warn('accessibility', 'name or alt is required for <Avatar />')
      }
    }, [alt, logger, name])

    const [hasError, setHasError] = useState(!src)
    useEffect(() => setHasError(!src), [src])
    const onError = useCallback(() => setHasError(true), [])

    const imgCss = css`
      width: ${width}px;
      height: ${width}px;
      border-radius: 50%;
      background-size: contain;
    `

    return (
      <div
        {...props}
        ref={ref}
        css={css`
          display: inline-flex;
          align-items: center;
          gap: 8px;
        `}
      >
        {src && !hasError ? (
          <img
            src={src}
            alt={alt}
            aria-hidden={!!name} // hide from screen reader if name is provided
            onError={onError}
            css={imgCss}
          />
        ) : (
          <i
            aria-label={alt}
            aria-hidden={!!name} // hide from screen reader if name is provided
            css={(theme) => css`
              ${imgCss}
              background-color: ${theme.palette.grayLight0};
            `}
          />
        )}
        {name && (
          <span
            css={css`
              max-width: 100px;
              ${textEllipsis};
            `}
          >
            {name}
          </span>
        )}
        {cn && (
          <span
            css={css`
              ${theme.typography.tooltip}
            `}
          >
            @{cn}
          </span>
        )}
      </div>
    )
  })
)
