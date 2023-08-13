import type { Meta, StoryObj } from '@storybook/react'
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
    items: [
      {
        before: <Icon name='edit' size='small' />,
        after: <Icon name='arrowcircleright' size='small' />,
        label: '添加为链接',
        description: '描述文字，描述文字，描述文字，描述文字，描述文字',
      },
      {
        before: <Icon name='edit' size='small' />,
        after: <Icon name='arrowcircleright' size='small' />,
        label:
          '添加为书签/书签/书签/书签/书签/书签/书签/书签/书签/书签/书签/书签/书签/书签/书签/书签',
        description:
          '描述文字，描述文字，描述文字，描述文字，描述文字，描述文字，描述文字，描述文字，描述文字，描述文字，描述文字，描述文字，描述文字，描述文字，描述文字，描述文字，描述文字，描述文字',
      },
      {
        before: <Icon name='edit' size='small' />,
        label: '添加为链接',
        description: '描述文字，描述文字，描述文字，描述文字，描述文字',
        disabled: true,
      },
      {
        label: '添加为书签',
        children: [
          {
            label: '添加为链接',
            description: '描述文字，描述文字，描述文字，描述文字，描述文字',
          },
          {
            label: '添加为书签',
            description: '描述文字，描述文字，描述文字，描述文字，描述文字',
          },
        ],
      },
      { label: '添加为链接', disabled: true },
      { label: '添加为书签' },
    ],
  },
}

export const Custom: Story = {
  args: {
    children: (
      <>
        <MenuItem label='添加为链接' />
        <MenuItem label='添加为书签' />
        <MenuItem label='添加为链接' disabled={true} />
        <MenuItem label='添加为书签' />
        <MenuItem label='添加为链接' disabled={true} />
        <MenuItem label='添加为书签' />
      </>
    ),
  },
}

export const Anchored: Story = {
  args: {
    anchor: (props) => (
      <Button color='primary' {...props}>
        Open Menu
      </Button>
    ),
    items: [
      { label: '添加为链接' },
      { label: '添加为书签' },
      { label: '添加为链接', disabled: true },
      { label: '添加为书签' },
      { label: '添加为链接', disabled: true },
      { label: '添加为书签' },
    ],
  },
}

export const Nested: Story = {
  args: {
    anchor: (props) => (
      <Button color='primary' {...props}>
        Open Menu
      </Button>
    ),
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
  return (
    <>
      <MenuItem before={<Icon name='edit' size='small' />} label='添加为链接' />
      <MenuItem
        before={<Icon name='edit' size='small' />}
        label='添加为书签'
        description='描述文字，描述文字，描述文字，描述文字，描述文字，描述文字'
      >
        {level < maxLevel ? (
          <NestedMenu level={level + 1} maxLevel={maxLevel} />
        ) : null}
      </MenuItem>
      <MenuItem
        before={<Icon name='edit' size='small' />}
        label='添加为书签'
        description='描述文字，描述文字，描述文字，描述文字，描述文字，描述文字'
        disabled={true}
      >
        {level < maxLevel ? (
          <NestedMenu level={level + 1} maxLevel={maxLevel} />
        ) : null}
      </MenuItem>
      <MenuItem
        before={<Icon name='edit' size='small' />}
        label='添加为链接'
        disabled={true}
      />
      <MenuItem before={<Icon name='edit' size='small' />} label='添加为书签' />
      <MenuItem
        before={<Icon name='edit' size='small' />}
        label='添加为链接'
        description='描述文字，描述文字，描述文字，描述文字，描述文字，描述文字'
        disabled={true}
      />
      <MenuItem
        before={<Icon name='edit' size='small' />}
        label='添加为书签/书签/书签/书签/书签/书签'
        description='描述文字，描述文字，描述文字，描述文字，描述文字，描述文字'
      >
        {level < maxLevel ? (
          <NestedMenu level={level + 1} maxLevel={maxLevel} />
        ) : null}
      </MenuItem>
      <MenuItem label='添加为链接' />
      <MenuItem
        label='添加为书签'
        description='描述文字，描述文字，描述文字，描述文字，描述文字，描述文字'
      />
    </>
  )
}
