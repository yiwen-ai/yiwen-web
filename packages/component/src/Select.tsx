import { css, useTheme } from '@emotion/react'
import { useControlled, useRefCallback, type ModalRef } from '@yiwen-ai/util'
import {
  forwardRef,
  memo,
  useCallback,
  useMemo,
  type HTMLAttributes,
} from 'react'
import { MenuItem, type MenuItemProps } from './Menu'
import { Popover, pickPopoverProps, type PopoverProps } from './Popover'
import { TextField } from './TextField'

export interface SelectProps<T>
  extends Omit<HTMLAttributes<HTMLUListElement>, 'defaultValue' | 'onChange'>,
    PopoverProps {
  placeholder: string
  options?: readonly SelectOptionProps<T>[]
  defaultValue?: T
  value?: T
  onChange?: (value: T) => void
}

export const Select = memo(
  forwardRef(function Select<T>(
    props: SelectProps<T>,
    forwardedRef: React.ForwardedRef<ModalRef>
  ) {
    const theme = useTheme()
    const {
      popoverProps,
      restProps: {
        placeholder,
        options,
        defaultValue,
        value: _value,
        onChange: _onChange,
        ...selectProps
      },
    } = pickPopoverProps(props)
    const [value, onChange] = useControlled({
      defaultValue,
      value: _value,
      onChange: _onChange,
    })
    const option = useMemo(
      () => options?.find((option) => option.value === value),
      [options, value]
    )
    const [ref, setRef] = useRefCallback(forwardedRef)

    return (
      <Popover
        anchor={(props) => (
          <TextField
            {...props}
            placeholder={placeholder}
            value={option?.label ?? ''}
            readOnly={true}
            css={css`
              cursor: pointer;
            `}
          />
        )}
        {...popoverProps}
        ref={setRef}
        css={css`
          width: 208px;
          padding: 20px 12px;
          box-sizing: border-box;
          border: 1px solid ${theme.color.menu.border};
          background: ${theme.color.menu.background};
        `}
      >
        <ul role='listbox' {...selectProps}>
          {options?.length
            ? options.map(({ onSelect, ...option }, index) => (
                <SelectOption
                  key={index}
                  selected={value === option.value}
                  onSelect={(value, ev) => {
                    onSelect?.(value as T, ev)
                    if (!ev.isPropagationStopped()) {
                      onChange(value as T)
                      ref?.close()
                    }
                  }}
                  {...option}
                />
              ))
            : selectProps.children}
        </ul>
      </Popover>
    )
  })
)

export interface SelectOptionProps<T>
  extends Omit<MenuItemProps, 'value' | 'onSelect' | 'children'> {
  selected?: boolean
  label: string
  value: T
  onSelect?: (value: T, ev: React.SyntheticEvent) => void
}

export const SelectOption = memo(
  forwardRef(function SelectOption<T>(
    {
      selected,
      label,
      value,
      onSelect,
      onClick,
      onKeyDown,
      ...props
    }: SelectOptionProps<T>,
    ref: React.ForwardedRef<HTMLLIElement>
  ) {
    const theme = useTheme()

    const handleClick = useCallback(
      (ev: React.MouseEvent<HTMLLIElement>) => {
        onClick?.(ev)
        if (!props.disabled && !ev.isPropagationStopped()) {
          onSelect?.(value, ev)
        }
      },
      [onClick, onSelect, props.disabled, value]
    )

    const handleKeyDown = useCallback(
      (ev: React.KeyboardEvent<HTMLLIElement>) => {
        onKeyDown?.(ev)
        if (
          !props.disabled &&
          !ev.isPropagationStopped() &&
          (ev.key === 'Enter' || ev.key === ' ')
        ) {
          onSelect?.(value, ev)
        }
      },
      [onKeyDown, onSelect, props.disabled, value]
    )

    if (props.hidden) return null

    return (
      <MenuItem
        role='option'
        aria-selected={selected}
        data-selected={selected ? '' : undefined}
        label={label}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...props}
        ref={ref}
        css={css`
          &[data-selected] {
            background: ${theme.color.menu.item.hover.background};
          }
        `}
      />
    )
  })
)
