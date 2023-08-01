import type { Meta, StoryObj } from '@storybook/react'
import { BrowserRouter } from 'react-router-dom'
import { Header } from './Header'

const meta: Meta<typeof Header> = {
  component: Header,
}

export default meta

type Story = StoryObj<typeof Header>

export const Default: Story = {
  render: (args) => (
    <BrowserRouter>
      <Header {...args} />
    </BrowserRouter>
  ),
  args: {
    brand: true,
  },
}
