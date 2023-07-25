import { css } from '@emotion/react'
import type { Meta, StoryObj } from '@storybook/react'
import { useRef } from 'react'
import { Button } from './Button'
import { Dialog } from './Dialog'

const meta: Meta<typeof Dialog> = {
  component: Dialog,
}

export default meta

type Story = StoryObj<typeof Dialog>

export const Default: Story = {
  args: {
    trigger: (props) => <Button {...props}>Open Dialog</Button>,
    head: 'Head',
    foot: 'Foot',
    children: (
      <div
        css={css`
          text-align: center;
        `}
      >
        Dialog Body
      </div>
    ),
  },
}

export const Nested: Story = {
  args: {
    trigger: (props) => <Button {...props}>Open Dialog</Button>,
    head: 'Head',
    foot: 'Foot',
    children: <NestedDialog />,
  },
}

function NestedDialog() {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={containerRef}
      css={css`
        text-align: center;
      `}
    >
      <Dialog
        trigger={(props) => (
          <Button {...props} variant='outlined'>
            Open Nested Dialog
          </Button>
        )}
        container={containerRef}
        head='Nested Head'
        css={css`
          margin-top: 25%;
        `}
      >
        <div
          css={css`
            margin: 20px 0 40px;
            text-align: center;
          `}
        >
          Nested Dialog Body
        </div>
      </Dialog>
    </div>
  )
}
