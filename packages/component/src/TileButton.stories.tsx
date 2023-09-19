import type { Meta, StoryObj } from '@storybook/react'
import { StructuredTileButton } from './TileButton'

const meta: Meta<typeof StructuredTileButton> = {
  component: StructuredTileButton,
  argTypes: {
    onClick: { action: 'onClick' }, // TODO: https://github.com/storybookjs/storybook/issues/15012
  },
}

export default meta

type Story = StoryObj<typeof StructuredTileButton>

export const Default: Story = {
  args: {
    text: '我有内容，去创作',
    icon: 'lampon',
    description: '用强大的 AI 能力进行语义搜索和全文智能翻译',
  },
}
