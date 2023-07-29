import { css, useTheme } from '@emotion/react'
import type { Meta, StoryObj } from '@storybook/react'
import { RGBA } from '@yiwen-ai/util'
import { Icon } from '.'
import { Button } from './Button'
import { Menu, MenuItem } from './Menu'

const meta: Meta<typeof Menu> = {
  component: Menu,
}

export default meta

type Story = StoryObj<typeof Menu>

export const Basic: Story = {
  args: {
    children: (
      <>
        <MenuItem>添加为链接</MenuItem>
        <MenuItem>添加为书签</MenuItem>
        <MenuItem disabled={true}>添加为链接</MenuItem>
        <MenuItem>添加为书签</MenuItem>
        <MenuItem disabled={true}>添加为链接</MenuItem>
        <MenuItem>添加为书签</MenuItem>
      </>
    ),
  },
}

export const Anchored: Story = {
  args: {
    anchor: (props) => <Button {...props}>Open Menu</Button>,
    children: (
      <>
        <MenuItem>添加为链接</MenuItem>
        <MenuItem>添加为书签</MenuItem>
        <MenuItem disabled={true}>添加为链接</MenuItem>
        <MenuItem>添加为书签</MenuItem>
        <MenuItem disabled={true}>添加为链接</MenuItem>
        <MenuItem>添加为书签</MenuItem>
      </>
    ),
  },
}

export const Nested: Story = {
  args: {
    anchor: (props) => <Button {...props}>Open Menu</Button>,
    children: <NestedMenu level={1} maxLevel={5} />,
  },
}

function NestedMenu({
  level,
  maxLevel,
}: {
  level: number
  maxLevel: number
}): JSX.Element {
  const theme = useTheme()

  const renderMenu = (text: string) =>
    level < maxLevel ? (
      <Menu
        anchor={(props) => (
          <div
            {...props}
            css={css`
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 12px;
            `}
          >
            <span>{text}</span>
            <Icon
              name='arrowcircleright'
              css={css`
                color: ${RGBA(theme.palette.grayLight, 0.4)};
              `}
            />
          </div>
        )}
        placement='right-start'
      >
        <NestedMenu level={level + 1} maxLevel={maxLevel} />
      </Menu>
    ) : (
      <div>{text}</div>
    )

  return (
    <>
      <MenuItem>添加为链接</MenuItem>
      <MenuItem>{renderMenu('添加为书签')}</MenuItem>
      <MenuItem disabled={true}>添加为链接</MenuItem>
      <MenuItem>添加为书签</MenuItem>
      <MenuItem disabled={true}>添加为链接</MenuItem>
      <MenuItem>{renderMenu('添加为书签')}</MenuItem>
    </>
  )
}
