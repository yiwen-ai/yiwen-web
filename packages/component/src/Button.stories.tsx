import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'
import { Icon } from './Icon'

const meta: Meta<typeof Button> = {
  component: Button,
  argTypes: {
    onClick: { action: 'onClick' }, // TODO: https://github.com/storybookjs/storybook/issues/15012
    size: {
      control: { type: 'radio' },
      options: ['small', 'medium', 'large'],
    },
    variant: {
      control: { type: 'radio' },
      options: ['contained', 'outlined'],
    },
    shape: {
      control: { type: 'radio' },
      options: ['square', 'rounded', 'circle'],
    },
  },
}

export default meta

type Story = StoryObj<typeof Button>

export const Primary: Story = {
  render: (args) => <Button {...args} color='primary' />,
  argTypes: {
    color: { control: { disable: true } },
  },
  args: {
    children: 'Button',
    size: 'medium',
    variant: 'contained',
    shape: 'rounded',
    disabled: false,
  },
}

export const Secondary: Story = {
  render: (args) => <Button {...args} color='secondary' />,
  argTypes: {
    color: { control: { disable: true } },
  },
  args: {
    children: 'Button',
    size: 'medium',
    variant: 'outlined',
    shape: 'rounded',
    disabled: false,
  },
}

export const IconButton: Story = {
  render: (args) => <Button {...args} shape='circle' />,
  argTypes: {
    shape: { control: { disable: true } },
  },
  args: {
    children: <Icon name='closecircle' />,
    size: 'medium',
    variant: 'contained',
    color: 'secondary',
    disabled: false,
  },
}
