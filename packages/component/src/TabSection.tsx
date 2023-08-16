import { css, useTheme } from '@emotion/react'
import { useClick, useControlled } from '@yiwen-ai/util'
import {
  createContext,
  forwardRef,
  memo,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type HTMLAttributes,
  type LiHTMLAttributes,
} from 'react'

const Context = createContext({
  value: undefined as unknown,
  onSelect: (value: unknown, ev: React.SyntheticEvent) => {},
  getTabId: (value: unknown) => undefined as string | undefined,
  setTabId: (value: unknown, id: string) => {},
  getPanelId: (value: unknown) => undefined as string | undefined,
  setPanelId: (value: unknown, id: string) => {},
})

export interface TabSectionProps<T>
  extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  defaultValue?: T
  value?: T
  onChange?: (value: T) => void
}

export const TabSection = memo(function TabSection<T>({
  defaultValue,
  value: _value,
  onChange: _onChange,
  ...props
}: TabSectionProps<T>) {
  const [value, onChange] = useControlled({
    defaultValue,
    value: _value,
    onChange: _onChange,
  })
  const [tabMap, setTabMap] = useState(() => new Map<unknown, string>())
  const [panelMap, setPanelMap] = useState(() => new Map<unknown, string>())
  const context = useMemo<React.ContextType<typeof Context>>(
    () => ({
      value,
      onSelect: onChange as (value: unknown) => void,
      getTabId: (value) => tabMap.get(value),
      setTabId: (value, id) => {
        setTabMap((map) => {
          return map.get(value) === id ? map : new Map(map).set(value, id)
        })
      },
      getPanelId: (value) => panelMap.get(value),
      setPanelId: (value, id) => {
        setPanelMap((map) => {
          return map.get(value) === id ? map : new Map(map).set(value, id)
        })
      },
    }),
    [onChange, panelMap, tabMap, value]
  )

  return (
    <Context.Provider value={context}>
      <div {...props} />
    </Context.Provider>
  )
})

interface TabListProps
  extends Omit<HTMLAttributes<HTMLUListElement>, 'defaultValue'> {}

export const TabList = memo(
  forwardRef(function TabList(
    props: TabListProps,
    ref: React.Ref<HTMLUListElement>
  ) {
    return (
      <ul
        role='tablist'
        {...props}
        ref={ref}
        css={css`
          display: flex;
          gap: 8px;
          list-style: none;
        `}
      />
    )
  })
)

export interface TabProps<T>
  extends Omit<LiHTMLAttributes<HTMLLIElement>, 'value' | 'onSelect'> {
  selected?: boolean
  disabled?: boolean
  value: T
  onSelect?: (value: T, ev: React.SyntheticEvent) => void
}

export const Tab = memo(
  forwardRef(function Tab<T>(
    { selected, disabled, value, onSelect, ...props }: TabProps<T>,
    ref: React.Ref<HTMLLIElement>
  ) {
    const theme = useTheme()
    const { getPanelId, getTabId, setTabId, ...context } = useContext(Context)

    selected = selected ?? value === context.value
    onSelect = onSelect ?? context.onSelect
    props = useClick(props, (ev) => {
      if (!disabled) {
        onSelect?.(value, ev)
      }
    })

    const panelId = getPanelId(value)
    const _id = useId()
    const id = props.id ?? getTabId(value) ?? _id
    useEffect(() => setTabId(value, id), [id, setTabId, value])

    return (
      <li
        id={id}
        role='tab'
        aria-controls={panelId}
        aria-selected={selected}
        data-selected={selected ? '' : undefined}
        aria-disabled={disabled}
        data-disabled={disabled ? '' : undefined}
        tabIndex={-1}
        {...props}
        ref={ref}
        css={css`
          padding: 8px;
          border-radius: 8px;
          ${theme.typography.h2}
          cursor: pointer;
          &[data-selected] {
            background: ${theme.color.tab.active.background};
            color: ${theme.color.tab.active.text};
            position: relative;
            ::after {
              content: '';
              position: absolute;
              bottom: 2px;
              left: 50%;
              transform: translateX(-50%);
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background: ${theme.color.tab.active.indicator};
            }
          }
          :hover {
            background: ${theme.color.tab.hover.background};
            color: ${theme.color.tab.hover.text};
          }
          &,
          &[data-disabled] {
            background: ${theme.color.tab.background};
            color: ${theme.color.tab.text};
          }
          &[data-disabled] {
            opacity: 0.5;
            cursor: not-allowed;
          }
        `}
      />
    )
  })
)

export interface TabPanelProps<T> extends HTMLAttributes<HTMLDivElement> {
  selected?: boolean
  value: T
}

export const TabPanel = memo(
  forwardRef(function TabPanel<T>(
    { selected, value, hidden, ...props }: TabPanelProps<T>,
    ref: React.Ref<HTMLDivElement>
  ) {
    const { getTabId, getPanelId, setPanelId, ...context } = useContext(Context)
    selected = selected ?? value === context.value
    hidden = hidden ?? !selected

    const tabId = getTabId(value)
    const _id = useId()
    const id = props.id ?? getPanelId(value) ?? _id
    useEffect(() => setPanelId(value, id), [id, setPanelId, value])

    return (
      <div
        id={id}
        role='tabpanel'
        aria-labelledby={tabId}
        hidden={hidden}
        {...props}
        ref={ref}
      >
        {hidden ? null : props.children}
      </div>
    )
  })
)
