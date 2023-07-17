import type { Meta, StoryObj } from '@storybook/react'
import { Logo } from './Logo'

const meta: Meta<typeof Logo> = {
  component: Logo,
}

export default meta

type Story = StoryObj<typeof Logo>

export const Medium: Story = {
  name: 'Medium (36x36, default)',
  args: {
    title: '亿文',
    size: 'medium',
  },
}
