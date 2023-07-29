import type { Meta, StoryObj } from '@storybook/react'
import { useCallback, useState } from 'react'
import { Alert } from './Alert'

const meta: Meta<typeof Alert> = {
  component: Alert,
  argTypes: {
    type: {
      control: { type: 'radio' },
      options: ['success', 'warning'],
    },
  },
}

export default meta

type Story = StoryObj<typeof Alert>

export const Success: Story = {
  argTypes: {
    type: { control: { disable: true } },
  },
  args: {
    type: 'success',
    message: 'Success',
    description: 'This is a success alert',
  },
}

export const Warning: Story = {
  argTypes: {
    type: { control: { disable: true } },
  },
  args: {
    type: 'warning',
    message: 'Warning',
    description: 'This is a warning alert',
  },
}

export const Close: Story = {
  render: (args) => {
    return <Uncontrolled />

    function Uncontrolled() {
      const [open, setOpen] = useState(true)
      const onClose = useCallback(() => setOpen(false), [])
      return open && <Alert key={args.type} {...args} onClose={onClose} />
    }
  },
  args: {
    type: 'success',
    message: 'Close',
    description: 'This alert can be closed',
  },
}
