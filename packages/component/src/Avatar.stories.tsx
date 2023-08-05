import type { Meta, StoryObj } from '@storybook/react'
import logo from '../../web/public/logo.svg'
import { Avatar } from './Avatar'

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
    src: logo,
    size: 'medium',
    alt: 'Logo',
  },
}

export const MediumWithName: Story = {
  name: 'Medium (36x36, with name)',
  args: {
    src: logo,
    size: 'medium',
    name: 'Logo',
  },
}
