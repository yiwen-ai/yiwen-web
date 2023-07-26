import { css } from '@emotion/react'
import type { Meta, StoryObj } from '@storybook/react'
import { AlertDialog } from './AlertDialog'
import { Button } from './Button'

const meta: Meta<typeof AlertDialog> = {
  component: AlertDialog,
}

export default meta

type Story = StoryObj<typeof AlertDialog>

export const Default: Story = {
  args: {
    trigger: (props) => <Button {...props}>Open Alert Dialog</Button>,
    head: 'Head',
    foot: 'Foot',
    body: (
      <div
        css={css`
          text-align: center;
        `}
      >
        Alert Dialog Body
      </div>
    ),
  },
}
