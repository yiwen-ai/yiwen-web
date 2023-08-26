import { css, useTheme, type CSSObject } from '@emotion/react'
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useId,
  type InputHTMLAttributes,
} from 'react'
import { useLogger } from './logger'

export type TextFieldSize = 'medium' | 'large'

const SizeDict: Record<TextFieldSize, CSSObject> = {
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

export interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: TextFieldSize
  before?: string | JSX.Element | (() => JSX.Element | null)
  after?: string | JSX.Element | (() => JSX.Element | null)
  onSearch?: (
    keyword: string,
    ev: React.KeyboardEvent<HTMLInputElement>
  ) => void
  onDismiss?: (ev: React.KeyboardEvent<HTMLInputElement>) => void
}

export const TextField = memo(
  forwardRef(function TextField(
    {
      className,
      size = 'medium',
      before,
      after,
      onKeyDown,
      onSearch,
      onDismiss,
      ...props
    }: TextFieldProps,
    ref: React.Ref<HTMLInputElement>
  ) {
    const theme = useTheme()
    const logger = useLogger()
    const _id = useId()
    const id = props.id ?? _id
    const sizeCSS = SizeDict[size]

    const handleKeyDown = useCallback(
      (ev: React.KeyboardEvent<HTMLInputElement>) => {
        onKeyDown?.(ev)
        if (ev.isDefaultPrevented()) return
        if (ev.key === 'Enter') {
          onSearch?.(ev.currentTarget.value, ev)
        } else if (ev.key === 'Escape') {
          onDismiss?.(ev)
        }
      },
      [onDismiss, onKeyDown, onSearch]
    )

    const ariaLabel = props['aria-label']
    useEffect(() => {
      if (!props.placeholder && !ariaLabel) {
        logger.warn(
          'accessibility',
          'placeholder or aria-label is required for <TextField />'
        )
      }
    }, [ariaLabel, logger, props.placeholder])

    return (
      <label
        htmlFor={id}
        className={className}
        role={onSearch ? 'search' : undefined}
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
        `}
      >
        {typeof before === 'function' ? (
          before()
        ) : before ? (
          <div
            css={css`
              align-self: stretch;
              display: flex;
              align-items: center;
            `}
          >
            {before}
          </div>
        ) : null}
        <input
          id={id}
          type={onSearch ? 'search' : 'text'}
          onKeyDown={handleKeyDown}
          {...props}
          ref={ref}
          css={css`
            flex: 1;
            max-width: 100%;
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
        {typeof after === 'function' ? (
          after()
        ) : after ? (
          <div
            css={css`
              align-self: stretch;
              display: flex;
              align-items: center;
            `}
          >
            {after}
          </div>
        ) : null}
      </label>
    )
  })
)
