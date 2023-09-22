import { css, useTheme } from '@emotion/react'
import { useControlled, useRefCallback, type ModalRef } from '@yiwen-ai/util'
import {
  forwardRef,
  memo,
  useCallback,
  useId,
  useMemo,
  type HTMLAttributes,
  type LiHTMLAttributes,
} from 'react'
import { Menu, MenuItem, type MenuItemProps } from './Menu'
import { Popover, pickPopoverProps, type PopoverProps } from './Popover'
import { TextField, type TextFieldSize } from './TextField'

export interface SelectProps<T>
  extends Omit<HTMLAttributes<HTMLUListElement>, 'defaultValue' | 'onChange'>,
    PopoverProps {
  size?: TextFieldSize
  placeholder?: string
  options?: readonly SelectOptionProps<T>[]
  defaultValue?: T
  value?: T
  disabled?: boolean
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
        className,
        size,
        placeholder,
        options,
        defaultValue,
        value: _value,
        disabled,
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
    const id = useId()

    return (
      <Popover
        anchor={(props) => (
          <TextField
            role='combobox'
            aria-controls={id}
            aria-expanded={ref?.open}
            aria-haspopup='listbox'
            className={className}
            size={size}
            placeholder={placeholder}
            value={option?.label ?? ''}
            readOnly={true}
            disabled={disabled}
            {...props}
            css={css`
              cursor: ${disabled ? 'not-allowed' : 'pointer'};
            `}
          />
        )}
        className={className}
        {...popoverProps}
        ref={setRef}
        css={css`
          padding: 20px 12px;
          border: 1px solid ${theme.color.menu.border};
          background: ${theme.color.menu.background};
        `}
      >
        <ul
          role='listbox'
          id={id}
          {...selectProps}
          css={css`
            padding-left: 0;
            display: flex;
            flex-direction: column;
            gap: 8px;
          `}
        >
          {options?.length
            ? options.map(({ key, onSelect, ...option }) => (
                <SelectOption
                  key={key}
                  selected={value === option.value}
                  onSelect={(value, ev) => {
                    onSelect?.(value, ev)
                    if (!ev.isDefaultPrevented()) {
                      onChange(value)
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
  key: React.Key
  selected?: boolean
  label: string
  dir?: string
  value: T
  onSelect?: (value: T, ev: React.SyntheticEvent) => void
}

export const SelectOption = memo(
  forwardRef(function SelectOption<T>(
    {
      selected,
      label,
      value,
      dir,
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
        if (!props.disabled && !ev.isDefaultPrevented()) {
          onSelect?.(value, ev)
        }
      },
      [onClick, onSelect, props.disabled, value]
    )

    if (props.hidden) return null

    return (
      <MenuItem
        role='option'
        aria-selected={selected}
        data-selected={selected ? '' : undefined}
        label={label}
        dir={dir}
        onClick={handleClick}
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

export interface SelectOptionGroupProps<T>
  extends LiHTMLAttributes<HTMLLIElement> {
  label: string | JSX.Element
  options?: readonly SelectOptionProps<T>[] | undefined
}

export const SelectOptionGroup = memo(function SelectOptionGroup<T>({
  label,
  options,
  ...props
}: SelectOptionGroupProps<T>) {
  const theme = useTheme()
  const id = useId()

  return (
    <li
      role='none'
      {...props}
      css={css`
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 8px;
      `}
    >
      <div
        id={id}
        css={css`
          padding: 4px 12px;
          ${theme.typography.tooltip}
          color: ${theme.color.menu.group.text};
        `}
      >
        {label}
      </div>
      <Menu role='group' aria-labelledby={id}>
        {options?.length
          ? options.map(({ key, ...option }) => (
              <SelectOption key={key} {...option} />
            ))
          : props.children}
      </Menu>
    </li>
  )
})
