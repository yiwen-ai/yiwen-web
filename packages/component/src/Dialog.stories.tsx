import { css } from '@emotion/react'
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogFoot,
  DialogHead,
} from './Dialog'

const meta: Meta<typeof Dialog> = {
  component: Dialog,
}

export default meta

type Story = StoryObj<typeof Dialog>

export const Default: Story = {
  args: {
    anchor: (props) => (
      <Button color='primary' {...props}>
        Open Dialog
      </Button>
    ),
    children: (
      <>
        <DialogHead>Head</DialogHead>
        <DialogBody>
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
        </DialogBody>
        <DialogFoot>Foot</DialogFoot>
        <DialogClose />
      </>
    ),
  },
}

export const Nested: Story = {
  args: {
    onShow: () => {},
    onClose: () => {},
    onToggle: () => {},
    anchor: (props) => (
      <Button color='primary' {...props}>
        Open Dialog
      </Button>
    ),
    children: (
      <>
        <DialogHead>Head</DialogHead>
        <NestedDialogBody level={1} maxLevel={5} />
        <DialogFoot>Foot</DialogFoot>
        <DialogClose />
      </>
    ),
  },
}

function NestedDialogBody({
  level,
  maxLevel,
}: {
  level: number
  maxLevel: number
}): JSX.Element {
  return (
    <DialogBody
      css={css`
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      `}
    >
      {level < maxLevel ? (
        <Dialog
          anchor={(props) => (
            <Button {...props} color='primary' variant='outlined'>
              {`Open #${level + 1} Dialog`}
            </Button>
          )}
          css={css`
            width: calc(min(800px, 100%) - 80px * 2 - 60px * ${level});
            height: calc(min(620px, 100%) - 80px * 2 - 60px * ${level});
            max-width: unset;
            max-height: unset;
          `}
        >
          <DialogHead>{`#${level + 1} Dialog`}</DialogHead>
          <NestedDialogBody level={level + 1} maxLevel={maxLevel} />
          <DialogHead>{`#${level + 1} Foot`}</DialogHead>
          <DialogClose />
        </Dialog>
      ) : (
        <div>{`#${level} Body`}</div>
      )}
    </DialogBody>
  )
}
