import { css } from '@emotion/react'
import { forwardRef, memo, useCallback } from 'react'

// TODO: replace with real avatar
const DEFAULT_AVATAR = 'https://via.placeholder.com/150'

type AvatarSize = 'medium'

const DEFAULT_SIZE: Record<AvatarSize, number> = {
  medium: 36,
}

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  name?: string
  size?: AvatarSize
}

export const Avatar = memo(
  forwardRef(function Avatar(
    { src = DEFAULT_AVATAR, alt, name, size = 'medium', ...props }: AvatarProps,
    ref: React.Ref<HTMLDivElement>
  ) {
    const width = DEFAULT_SIZE[size]

    const onError = useCallback(() => {
      // TODO: use default avatar on error
    }, [])

    return (
      <div
        {...props}
        ref={ref}
        css={css`
          display: flex;
          align-items: center;
        `}
      >
        <img
          src={src}
          alt={alt ?? name}
          onError={onError}
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
