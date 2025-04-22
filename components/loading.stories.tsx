import '../styles/globals.css'
import { Meta, StoryObj } from '@storybook/react'

import { Loading } from './loading'

export default {
  title: 'Common/Loading',
  component: Loading,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof Loading>

type Story = StoryObj<typeof Loading>
export const Default: Story = {
  args: {},
}
