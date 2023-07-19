import { css } from '@emotion/react'
import type { Meta, StoryObj } from '@storybook/react'
import { Header } from './Header'

const meta: Meta<typeof Header> = {
  component: Header,
}

export default meta

type Story = StoryObj<typeof Header>

export const Default: Story = {
  args: {
    children: (
      <div
        css={css`
          flex: 1;
          display: flex;
          margin-left: 12px;
          margin-right: 40px;
        `}
      >
        <h1>yiwen.ai</h1>
      </div>
    ),
  },
}
