import React from 'react'
import { Meta, StoryObj } from '@storybook/react'

import '../styles/globals.css'
import { currentTimestampInSeconds } from '../utils/date'

import { Countdown } from './countdown'
export default {
  title: 'Common/Countdown',
  component: Countdown,
  parameters: {
    layout: 'centered',
  },
  render: () => (
    <div className="flex flex-col w-[100vw] min-h-[100vh] bg-gray-950">
      <Countdown initialSeconds={1000000 + currentTimestampInSeconds()} />
    </div>
  ),
} as Meta<typeof Countdown>

type Story = StoryObj<typeof Countdown>

export const Default: Story = {
  args: {},
}
