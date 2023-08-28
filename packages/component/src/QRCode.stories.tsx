import type { Meta, StoryObj } from '@storybook/react'
import { QRCode } from './QRCode'

const meta: Meta<typeof QRCode> = {
  component: QRCode,
}

export default meta

type Story = StoryObj<typeof QRCode>

export const Basic: Story = {
  args: {
    value: 'https://www.yiwen.ltd/',
    style: { width: 256 },
  },
}
