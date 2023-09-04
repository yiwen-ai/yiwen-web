import { forwardRef, memo, useCallback } from 'react'

/**
 * https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/main/docs/rules/anchor-is-valid.md#case-i-want-to-perform-an-action-and-need-a-clickable-ui-element
 */
export const Clickable = memo(
  forwardRef(function Clickable(
    { onClick, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>,
    ref: React.Ref<HTMLAnchorElement>
  ) {
    const handleClick = useCallback(
      (ev: React.MouseEvent<HTMLAnchorElement>) => {
        ev.preventDefault()
        onClick?.(ev)
      },
      [onClick]
    )

    return (
      <a href='#_' onClick={handleClick} {...props} ref={ref}>
        {props.children}
      </a>
    )
  })
)
