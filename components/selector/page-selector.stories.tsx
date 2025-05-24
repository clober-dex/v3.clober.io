import { Meta, StoryObj } from '@storybook/react'

import '../../styles/globals.css'

import { PageSelector } from './page-selector'
export default {
  title: 'Selector/PageSelector',
  component: PageSelector,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof PageSelector>

type Story = StoryObj<typeof PageSelector>
export const Default: Story = {
  args: {},
}
