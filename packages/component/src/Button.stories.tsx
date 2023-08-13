import type { Meta, StoryObj } from '@storybook/react'
import { Button, IconButton, type IconButtonProps } from './Button'

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
      options: ['contained', 'outlined', 'text'],
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
    variant: 'contained',
    shape: 'rounded',
    size: 'medium',
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
    variant: 'outlined',
    shape: 'rounded',
    size: 'medium',
    disabled: false,
  },
}

export const TextButton: Story = {
  render: (args) => <Button {...args} variant='text' />,
  argTypes: {
    variant: { control: { disable: true } },
  },
  args: {
    children: 'Text Button',
    color: 'primary',
    shape: 'rounded',
    size: 'medium',
    disabled: false,
  },
}

export const BasicIconButton: Story = {
  name: 'Icon Button',
  render: (args) => <IconButton {...(args as IconButtonProps)} />,
  args: {
    iconName: 'closecircle',
    color: 'secondary',
    variant: 'text',
    shape: 'circle',
    size: 'small',
    disabled: false,
  } as IconButtonProps,
}
