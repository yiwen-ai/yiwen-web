import type { Meta, StoryObj } from '@storybook/react'
import { Select } from './Select'

const meta: Meta<typeof Select> = {
  component: Select,
}

export default meta

type Story = StoryObj<typeof Select>

export const Basic: Story = {
  args: {
    placeholder: '请选择',
    options: [
      { label: '添加为链接', description: '#1', value: '1' },
      { label: '添加为书签', description: '#2', value: '2' },
      { label: '添加为链接', description: '#3', value: '3', disabled: true },
      { label: '添加为书签', description: '', value: '4' },
      { label: '添加为链接', description: '', value: '5', disabled: true },
      { label: '添加为书签', description: '', value: '6' },
    ],
  },
}
