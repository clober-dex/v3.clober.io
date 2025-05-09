import React from 'react'
import '../../styles/globals.css'
import { Meta, StoryObj } from '@storybook/react'
import { zeroAddress } from 'viem'
import { mainnet } from 'viem/chains'

import { MarketCard } from './market-card'

export default {
  title: 'Card/MarketCard',
  component: MarketCard,
  parameters: {
    layout: 'centered',
  },
  render: ({ ...args }) => (
    <div className="flex w-[338px] lg:w-full">
      <MarketCard {...args} />
    </div>
  ),
} as Meta<typeof MarketCard>

type Story = StoryObj<typeof MarketCard>

export const Default: Story = {
  args: {
    chain: mainnet,
    baseCurrency: {
      symbol: 'BTC',
      name: 'BTC',
      address: zeroAddress,
      decimals: 18,
    },
    quoteCurrency: {
      symbol: 'USDC',
      name: 'USD Coin',
      address: zeroAddress,
      decimals: 18,
    },
    createAt: 1744005461,
    price: 100000,
    fdv: 100000,
    dailyVolume: 100000,
    dailyChange: 0.2,
    verified: true,
    isBidTaken: false,
    isAskTaken: false,
  },
}

export const Minus: Story = {
  args: {
    baseCurrency: {
      symbol: 'BTC',
      name: 'BTC',
      address: zeroAddress,
      decimals: 18,
    },
    quoteCurrency: {
      symbol: 'USDC',
      name: 'USD Coin',
      address: zeroAddress,
      decimals: 18,
    },
    createAt: 1744005461,
    price: 100000,
    fdv: 100000,
    dailyVolume: 100000,
    dailyChange: 0.2,
    verified: true,
    isBidTaken: false,
    isAskTaken: false,
  },
}

export const NotVerified: Story = {
  args: {
    baseCurrency: {
      symbol: 'BTC',
      name: 'BTC',
      address: zeroAddress,
      decimals: 18,
    },
    quoteCurrency: {
      symbol: 'USDC',
      name: 'USD Coin',
      address: zeroAddress,
      decimals: 18,
    },
    createAt: 1744005461,
    price: 100000,
    fdv: 100000,
    dailyVolume: 100000,
    dailyChange: 0.2,
    verified: false,
    isBidTaken: false,
    isAskTaken: false,
  },
}

// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString()
}
