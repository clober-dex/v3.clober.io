import React from 'react'
import '../styles/globals.css'
import { Meta, StoryObj } from '@storybook/react'
import { zeroAddress } from 'viem'

import { LeaderBoard } from './leader-board'

const vaules = Array.from({ length: 1000 }, (_, i) => ({
  rank: i + 1,
  value: Math.random() * 1000,
  address: zeroAddress,
})).sort((a, b) => b.value - a.value)

export default {
  title: 'Common/LeaderBoard',
  component: LeaderBoard,
  parameters: {
    layout: 'centered',
  },
  render: (args) => (
    <div className="w-[760px] flex">
      <LeaderBoard {...args} />
    </div>
  ),
} as Meta<typeof LeaderBoard>

type Story = StoryObj<typeof LeaderBoard>
export const Default: Story = {
  args: {
    values: vaules,
    myValue: vaules[120],
    explorerUrl: '',
  },
}

export const Public: Story = {
  args: {
    values: vaules,
    myValue: undefined,
    explorerUrl: '',
  },
}
