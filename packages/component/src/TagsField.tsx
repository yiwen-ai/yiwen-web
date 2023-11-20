import { css, useTheme, type CSSObject } from '@emotion/react'
import { preventDefaultStopPropagation } from '@yiwen-ai/util'
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useId,
  useState,
  type InputHTMLAttributes,
} from 'react'
import { Button } from './Button'
import { Icon } from './Icon'
import { useLogger } from './logger'

export type TagsFieldSize = 'medium' | 'large'

const SizeDict: Record<TagsFieldSize, CSSObject> = {
  medium: {
    height: 28,
    paddingLeft: 12,
    paddingRight: 12,
    borderRadius: 10,
    gap: 8,
  },
  large: {
    height: 36,
    paddingLeft: 16,
    paddingRight: 16,
    borderRadius: 8,
    gap: 12,
  },
}

export interface TagsFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: TagsFieldSize | undefined
  maxTags?: number | undefined
  defaultValue?: string[] | undefined
  onEnter?: (value: string[], ev: React.KeyboardEvent<HTMLInputElement>) => void
  onDismiss?: (ev: React.KeyboardEvent<HTMLInputElement>) => void
}

export const TagsField = memo(
  forwardRef(function TagsField(
    {
      className,
      size = 'medium',
      maxTags = 0,
      defaultValue = [],
      onKeyDown,
      onEnter,
      onDismiss,
      ...props
    }: TagsFieldProps,
    ref: React.Ref<HTMLInputElement>
  ) {
    const theme = useTheme()
    const logger = useLogger()
    const _id = useId()
    const id = props.id ?? _id
    const sizeCSS = SizeDict[size]
    const inputtype = 'text'
    const [tags, setTags] = useState<string[]>(defaultValue)

    const handleKeyDown = useCallback(
      (ev: React.KeyboardEvent<HTMLInputElement>) => {
        onKeyDown?.(ev)
        if (ev.isDefaultPrevented()) return

        if (ev.key === 'Enter') {
          const items = ev.currentTarget.value
            .split(/[,;，；]/)
            .map((s) => s.trim())
            .filter((s) => s && !tags.includes(s))
          if (
            items.length > 0 &&
            (!maxTags || tags.length + items.length <= maxTags)
          ) {
            setTags((tags) => {
              const val = [...tags, ...items]
              onEnter?.(val, ev)
              return val
            })
          }

          ev.currentTarget.value = ''
        } else if (ev.key === 'Escape') {
          onDismiss?.(ev)
        }
      },
      [onDismiss, onKeyDown, onEnter, tags, setTags, maxTags]
    )

    const handleDelete = useCallback(
      (ev: React.MouseEvent<HTMLButtonElement>) => {
        const tag = ev.currentTarget.value
        setTags((tags) => {
          const i = tags.indexOf(tag)
          return [...tags.slice(0, i), ...tags.slice(i + 1)]
        })
      },
      [setTags]
    )

    const ariaLabel = props['aria-label']
    useEffect(() => {
      if (!props.placeholder && !ariaLabel) {
        logger.warn(
          'accessibility',
          'placeholder or aria-label is required for <TagsField />'
        )
      }
    }, [ariaLabel, logger, props.placeholder])

    return (
      <label
        htmlFor={id}
        className={className}
        role={inputtype}
        css={css`
          ${sizeCSS}
          display: inline-flex;
          align-items: center;
          border: 1px solid ${theme.color.input.border};
          box-sizing: border-box;
          cursor: ${props.disabled
            ? 'not-allowed'
            : props.readOnly
            ? 'default'
            : 'text'};
          :hover {
            border-color: ${theme.color.input.hover.border};
          }
          :focus-within {
            border-color: ${theme.color.input.focus.border};
          }
          button {
            transition: width 0.4s ease-in-out;
            svg {
              display: none;
            }
            :hover > svg {
              display: inline-flex;
            }
          }
        `}
      >
        {tags.map((tag) => (
          <Button
            key={tag}
            color='secondary'
            variant='outlined'
            size={size}
            value={tag}
            onClick={handleDelete}
          >
            <span>{tag}</span>
            <Icon name='delete' size={size} />
          </Button>
        ))}
        <input
          id={id}
          type={inputtype}
          onKeyDown={handleKeyDown}
          onChange={preventDefaultStopPropagation}
          {...props}
          ref={ref}
          css={css`
            flex: 1;
            min-width: 100px;
            border: none;
            outline: none;
            background: none;
            color: inherit;
            font-size: inherit;
            font-weight: inherit;
            line-height: inherit;
            cursor: inherit;
            ::placeholder {
              color: ${theme.color.input.placeholder};
            }
          `}
        />
      </label>
    )
  })
)
