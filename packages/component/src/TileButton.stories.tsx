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
    description: '获得语义检索分析，AI 以及众包翻译等更多权利',
  },
}
