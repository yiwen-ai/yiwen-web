import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

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
  },
}

export default meta

type Story = StoryObj<typeof Button>

export const Primary: Story = {
  render: (args) => <Button {...args} color="primary" />,
  args: {
    children: 'Button',
    size: 'medium',
    variant: 'contained',
    disabled: false,
  },
}

export const Secondary: Story = {
  render: (args) => <Button {...args} color="secondary" />,
  args: {
    children: 'Button',
    size: 'medium',
    variant: 'outlined',
    disabled: false,
  },
}
