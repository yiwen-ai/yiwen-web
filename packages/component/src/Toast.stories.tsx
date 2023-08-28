import { css } from '@emotion/react'
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'
import { Toast, useToast, type ToastProps } from './Toast'

const meta: Meta<typeof Toast> = {
  component: Toast,
}

export default meta

type Story = StoryObj<typeof Toast>

export const Success: Story = {
  render: (args) => <Push {...args} />,
  args: {
    type: 'success',
    message: 'Success',
    description: 'This is a success message, will close in 3 seconds.',
  },
}

export const Warning: Story = {
  render: (args) => <Push {...args} />,
  args: {
    type: 'warning',
    message: 'Warning',
    description: 'This is a warning message, will close in 3 seconds.',
  },
}

export const Persistent: Story = {
  render: (args) => <Push {...args} />,
  args: {
    type: 'success',
    message: 'Persistent',
    description: 'This is a persistent message, will not close.',
    duration: Infinity,
  },
}

function Push(toast: ToastProps) {
  const { renderToastContainer, pushToast } = useToast()
  const onClick = () => {
    pushToast({
      ...toast,
      description: (
        <>
          <div>{new Date().toLocaleTimeString()}</div>
          <div>{toast.description}</div>
        </>
      ),
    })
  }

  return (
    <div
      css={css`
        position: fixed;
        inset: 0;
        width: 100vw;
        height: 100vh;
        padding: 36px;
        box-sizing: border-box;
        display: flex;
        align-items: flex-end;
        justify-content: center;
      `}
    >
      {renderToastContainer()}
      <Button color='primary' onClick={onClick}>
        Push
      </Button>
    </div>
  )
}
