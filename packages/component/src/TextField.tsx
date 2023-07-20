import { css, useTheme, type CSSObject } from '@emotion/react'
import type React from 'react'
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
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
    height: 54,
    paddingLeft: 20,
    paddingRight: 20,
    borderRadius: 14,
    gap: 12,
  },
}

export interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: TextFieldSize
  before?: string | JSX.Element | (() => JSX.Element)
  after?: string | JSX.Element | (() => JSX.Element)
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
    const sizeCSS = SizeDict[size]

    const handleKeyDown = useCallback(
      (ev: React.KeyboardEvent<HTMLInputElement>) => {
        onKeyDown?.(ev)
        if (ev.isPropagationStopped()) return
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
        className={className}
        css={css`
          ${sizeCSS}
          display: inline-flex;
          border: 1px solid ${theme.color.input.border};
          box-sizing: border-box;
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
              display: flex;
              align-items: center;
            `}
          >
            {before}
          </div>
        ) : null}
        <input
          type='text'
          aria-invalid={false}
          {...props}
          ref={ref}
          onKeyDown={handleKeyDown}
          css={css`
            flex: 1;
            border: none;
            outline: none;
            background: none;
            color: inherit;
            font-size: inherit;
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
