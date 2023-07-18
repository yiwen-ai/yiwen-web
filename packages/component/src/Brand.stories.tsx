import type { Meta, StoryObj } from '@storybook/react'
import { Brand } from './Brand'

const meta: Meta<typeof Brand> = {
  component: Brand,
}

export default meta

type Story = StoryObj<typeof Brand>

export const Default: Story = {}
