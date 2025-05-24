import React from 'react'
import { Meta, StoryObj } from '@storybook/react'
import '../../styles/globals.css'
import { mainnet } from 'viem/chains'

import { CurrencyIcon } from './currency-icon'

export default {
  title: 'Icon/CurrencyIcon',
  component: CurrencyIcon,
  parameters: {
    layout: 'centered',
  },
  render: ({ ...args }) => (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <CurrencyIcon {...args} />
    </div>
  ),
} as Meta<typeof CurrencyIcon>

type Story = StoryObj<typeof CurrencyIcon>

export const Default: Story = {
  args: {
    chain: mainnet,
    currency: {
      address: '0x0000000000000000000000000000000000000001',
      name: 'USDC',
      symbol: 'USDC',
      decimals: 6,
    },
  },
}

export const Unknown: Story = {
  args: {
    chain: mainnet,
    currency: {
      address: '0x0000000000000000000000000000000000000001',
      name: 'USDK',
      symbol: 'USDK',
      decimals: 6,
    },
  },
}
