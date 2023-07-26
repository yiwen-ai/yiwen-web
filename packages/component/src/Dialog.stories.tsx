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
    body: (
      <div
        css={css`
          height: 150%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        `}
      >
        Scrollable Dialog Body
      </div>
    ),
  },
}

export const Nested: Story = {
  args: {
    trigger: (props) => <Button {...props}>Open Dialog</Button>,
    head: 'Head',
    foot: 'Foot',
    body: <NestedDialog />,
  },
}

function NestedDialog() {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={containerRef}
      css={css`
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
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
          margin: min(25%, 200px);
          border-radius: 20px;
        `}
      >
        <div
          css={css`
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          `}
        >
          Nested Dialog Body
        </div>
      </Dialog>
    </div>
  )
}
