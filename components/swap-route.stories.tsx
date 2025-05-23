import React from 'react'
import '../styles/globals.css'
import { Meta, StoryObj } from '@storybook/react'

import { SwapRoute } from './swap-router'

export default {
  title: 'Common/SwapRoute',
  component: SwapRoute,
  parameters: {
    layout: 'centered',
  },
  render: ({ ...args }) => (
    <div className="flex w-[359px] sm:w-[740px]">
      <SwapRoute {...args} />
    </div>
  ),
} as Meta<typeof SwapRoute>

type Story = StoryObj<typeof SwapRoute>
export const Default: Story = {
  args: {
    quote: {
      amountIn: 1020000000000000000n,
      amountOut: 1000000000n,
      gasLimit: 2100000n,
      aggregator: { name: 'Uniswap' } as any,
      transaction: undefined,
    },
    prices: {
      ['0x0000000000000000000000000000000000000000']: 3000,
      ['0x0000000000000000000000000000000000000003']: 1,
    },
    isBestQuote: false,
    priceDifference: -1.2,
    outputCurrency: {
      address: '0x0000000000000000000000000000000000000003',
      name: 'USDC',
      symbol: 'USDC',
      decimals: 6,
    },
    aggregatorName: 'Uniswap',
  },
}

export const Best: Story = {
  args: {
    quote: {
      amountIn: 1020000000000000000n,
      amountOut: 1000000000n,
      gasLimit: 2100000n,
      aggregator: { name: 'Uniswap' } as any,
      transaction: undefined,
    },
    prices: {
      ['0x0000000000000000000000000000000000000000']: 3000,
      ['0x0000000000000000000000000000000000000003']: 1,
    },
    isBestQuote: true,
    priceDifference: 0,
    outputCurrency: {
      address: '0x0000000000000000000000000000000000000003',
      name: 'USDC',
      symbol: 'USDC',
      decimals: 6,
    },
    aggregatorName: 'Uniswap',
  },
}

export const Null: Story = {
  args: {
    quote: undefined,
    prices: {
      ['0x0000000000000000000000000000000000000000']: 3000,
      ['0x0000000000000000000000000000000000000003']: 1,
    },
    isBestQuote: false,
    priceDifference: 0,
    outputCurrency: {
      address: '0x0000000000000000000000000000000000000003',
      name: 'USDC',
      symbol: 'USDC',
      decimals: 6,
    },
    aggregatorName: 'Uniswap',
  },
}

// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString()
}
