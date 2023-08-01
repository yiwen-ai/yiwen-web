import type { Meta, StoryObj } from '@storybook/react'
import { Tab, TabList, TabPanel, TabSection } from './TabSection'

const meta: Meta<typeof TabSection> = {
  component: TabSection,
}

export default meta

type Story = StoryObj<typeof TabSection>

export const Basic: Story = {
  render: ({ onChange, ...args }) => <TabSection {...args} />,
  args: {
    defaultValue: 'd',
    children: (
      <>
        <TabList>
          <Tab value='a'>Aaa</Tab>
          <Tab value='b'>Bbb</Tab>
          <Tab value='c' disabled={false}>
            Ccc
          </Tab>
          <Tab value='d' disabled={true}>
            Ddd
          </Tab>
          <Tab value='e'>Eee</Tab>
          <Tab value='f'>Fff</Tab>
        </TabList>
        <TabPanel value='a'>Panel Aaa</TabPanel>
        <TabPanel value='b'>Panel Bbb</TabPanel>
        <TabPanel value='c'>Panel Ccc</TabPanel>
        <TabPanel value='d'>Panel Ddd</TabPanel>
        <TabPanel value='e'>Panel Eee</TabPanel>
        <TabPanel value='f'>Panel Fff</TabPanel>
      </>
    ),
  },
}
