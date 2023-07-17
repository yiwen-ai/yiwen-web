import type { Meta, StoryObj } from '@storybook/react'
import { Avatar } from './Avatar'
import { LOGO_URL } from './Logo'

const meta: Meta<typeof Avatar> = {
  component: Avatar,
  argTypes: {
    size: {
      control: { type: 'radio' },
      options: ['small', 'medium'],
    },
  },
}

export default meta

type Story = StoryObj<typeof Avatar>

export const Medium: Story = {
  name: 'Medium (36x36, default)',
  args: {
    src: LOGO_URL,
    size: 'medium',
    alt: 'Logo',
  },
}

export const MediumWithName: Story = {
  name: 'Medium (36x36, with name)',
  args: {
    src: LOGO_URL,
    size: 'medium',
    name: 'Logo',
  },
}
