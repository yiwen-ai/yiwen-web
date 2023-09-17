import { css, useTheme } from '@emotion/react'
import { Icon, type IconName } from '@yiwen-ai/component'
import { forwardRef, memo } from 'react'

// eslint-disable-next-line react-refresh/only-export-components
export default memo(
  forwardRef(function Section(
    {
      header,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & {
      header: JSX.Element
    },
    ref: React.Ref<HTMLDivElement>
  ) {
    return (
      <div
        {...props}
        ref={ref}
        css={css`
          display: flex;
          flex-direction: column;
          gap: 16px;
        `}
      >
        {header}
        {props.children}
      </div>
    )
  })
)

export function SectionHeader(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      css={css`
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
      `}
    />
  )
}

export function SectionTitle({
  iconName,
  label,
  active,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  iconName: IconName
  label: string
  active?: boolean
}) {
  const theme = useTheme()

  return (
    <div
      {...props}
      css={css`
        display: flex;
        align-items: center;
        gap: 4px;
        font-weight: ${active ? 600 : undefined};
        color: ${active
          ? theme.color.body.primary
          : theme.color.body.secondary};
        :hover {
          color: ${theme.color.body.primary};
        }
      `}
    >
      <Icon name={iconName} size='small' />
      <span>{label}</span>
    </div>
  )
}
