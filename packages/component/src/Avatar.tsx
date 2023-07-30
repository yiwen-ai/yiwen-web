import { css } from '@emotion/react'
import { forwardRef, memo, useEffect, type HTMLAttributes } from 'react'
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
  src: string
  /**
   * not required if `name` is provided
   */
  alt?: string
  /**
   * optional name to display
   */
  name?: string
  size?: AvatarSize | number
}

export const Avatar = memo(
  forwardRef(function Avatar(
    { src, alt, name, size = 'medium', ...props }: AvatarProps,
    ref: React.Ref<HTMLDivElement>
  ) {
    const width = typeof size === 'number' ? size : SizeDict[size]
    const logger = useLogger()

    useEffect(() => {
      if (!name && !alt) {
        logger.warn('accessibility', 'name or alt is required for <Avatar />')
      }
    }, [alt, logger, name])

    return (
      <div
        {...props}
        ref={ref}
        css={css`
          display: inline-flex;
          align-items: center;
        `}
      >
        <img
          src={src}
          alt={alt}
          aria-hidden={!!name} // hide from screen reader if name is provided
          css={css`
            width: ${width}px;
            height: ${width}px;
            border-radius: 50%;
            background-size: contain;
          `}
        />
        {name && (
          <span
            css={css`
              margin-left: 8px;
            `}
          >
            {name}
          </span>
        )}
      </div>
    )
  })
)
