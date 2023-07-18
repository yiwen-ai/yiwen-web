import type { Meta, StoryObj } from '@storybook/react'
import { Logo } from './Logo'

const meta: Meta<typeof Logo> = {
  component: Logo,
  argTypes: {
    size: {
      control: { type: 'radio' },
      options: ['small', 'medium'],
    },
  },
}

export default meta

type Story = StoryObj<typeof Logo>

export const Medium: Story = {
  name: 'Medium (36x36, default)',
  args: {
    size: 'medium',
  },
}
