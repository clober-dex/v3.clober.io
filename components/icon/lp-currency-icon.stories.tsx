import React from 'react'
import { Meta, StoryObj } from '@storybook/react'
import '../../styles/globals.css'
import { mainnet } from 'viem/chains'

import { LpCurrencyIcon } from './lp-currency-icon'

export default {
  title: 'Icon/LpCurrencyIcon',
  component: LpCurrencyIcon,
  parameters: {
    layout: 'centered',
  },
  render: ({ ...args }) => (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <LpCurrencyIcon {...args} />
    </div>
  ),
} as Meta<typeof LpCurrencyIcon>

type Story = StoryObj<typeof LpCurrencyIcon>

export const Default: Story = {
  args: {
    chain: mainnet,
    currencyA: {
      address: '0x0000000000000000000000000000000000000001',
      name: 'USDC',
      symbol: 'USDC',
      decimals: 6,
    },
    currencyB: {
      address: '0x0000000000000000000000000000000000000000',
      name: 'ETH',
      symbol: 'ETH',
      decimals: 6,
    },
  },
}
