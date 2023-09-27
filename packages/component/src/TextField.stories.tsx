import type { Meta, StoryObj } from '@storybook/react'
import { Icon } from './Icon'
import { TextField } from './TextField'

const meta: Meta<typeof TextField> = {
  component: TextField,
  argTypes: {
    size: {
      control: { type: 'radio' },
      options: ['medium', 'large'],
    },
  },
}

export default meta

type Story = StoryObj<typeof TextField>

export const Default: Story = {
  name: 'Default',
  args: {
    size: 'medium',
    placeholder: 'Placeholder',
    onEnter: undefined as never,
  },
}

export const SearchBox: Story = {
  name: 'Search Box',
  args: {
    size: 'large',
    placeholder: 'Search',
    before: <Icon name='search' size={20} />,
  },
}
