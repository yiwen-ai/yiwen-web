import { css } from '@emotion/react'
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'
import { Popover } from './Popover'

const meta: Meta<typeof Popover> = {
  component: Popover,
}

export default meta

type Story = StoryObj<typeof Popover>

export const Default: Story = {
  args: {
    anchor: (props) => (
      <Button color='primary' {...props}>
        Open Popover
      </Button>
    ),
    children: <div>Popover Body</div>,
  },
}

export const Nested: Story = {
  args: {
    anchor: (props) => (
      <Button color='primary' {...props}>
        Open Popover
      </Button>
    ),
    children: <NestedPopoverBody level={1} maxLevel={5} />,
  },
}

function NestedPopoverBody({
  level,
  maxLevel,
}: {
  level: number
  maxLevel: number
}): JSX.Element {
  return (
    <div
      css={css`
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 24px;
      `}
    >
      <div>{`#${level} Popover`}</div>
      {level < maxLevel && (
        <Popover
          anchor={(props) => (
            <Button {...props} color='primary' variant='outlined'>
              {`Open #${level + 1} Popover`}
            </Button>
          )}
        >
          <NestedPopoverBody level={level + 1} maxLevel={maxLevel} />
        </Popover>
      )}
    </div>
  )
}
