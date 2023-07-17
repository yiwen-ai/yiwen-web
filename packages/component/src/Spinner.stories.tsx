import type { Meta, StoryObj } from '@storybook/react'
import { Spinner } from './Spinner'

const meta: Meta<typeof Spinner> = {
  component: Spinner,
  argTypes: {
    size: {
      control: { type: 'radio' },
      options: ['small', 'medium', 'large'],
    },
  },
}

export default meta

type Story = StoryObj<typeof Spinner>

export const Medium: Story = {
  name: 'Medium (24x24, default)',
  args: {
    size: 'medium',
  },
}
