import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  component: Button,
  // TODO: https://github.com/storybookjs/storybook/issues/15012
  argTypes: { onClick: { action: 'onClick' } },
}

export default meta

type Story = StoryObj<typeof Button>

export const Primary: Story = {
  args: {
    children: 'Button',
  },
}
