import type { Meta, StoryObj } from '@storybook/react'
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogClose,
  AlertDialogFoot,
  AlertDialogHead,
} from './AlertDialog'
import { Button } from './Button'

const meta: Meta<typeof AlertDialog> = {
  component: AlertDialog,
}

export default meta

type Story = StoryObj<typeof AlertDialog>

export const Default: Story = {
  args: {
    anchor: (props) => <Button {...props}>Open Alert Dialog</Button>,
    children: (
      <>
        <AlertDialogHead>Head</AlertDialogHead>
        <AlertDialogBody>Alert Dialog Body</AlertDialogBody>
        <AlertDialogFoot>Foot</AlertDialogFoot>
        <AlertDialogClose />
      </>
    ),
  },
}
