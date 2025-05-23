import React from 'react'
import '../styles/globals.css'
import { Meta, StoryObj } from '@storybook/react'

import { SwapRouteList } from './swap-router-list'

export default {
  title: 'Common/SwapRouteList',
  component: SwapRouteList,
  parameters: {
    layout: 'centered',
  },
  render: ({ ...args }) => (
    <div className="flex w-[359px] sm:w-[740px]">
      <SwapRouteList {...args} />
    </div>
  ),
} as Meta<typeof SwapRouteList>

type Story = StoryObj<typeof SwapRouteList>
export const Default: Story = {
  args: {
    quotes: [
      {
        amountIn: 1020000000000000000n,
        amountOut: 1000000000n,
        gasLimit: 2100000n,
        aggregator: { name: 'Uniswap' } as any,
        transaction: undefined,
      },
      {
        amountIn: 1020000000000000000n,
        amountOut: 1300000000n,
        gasLimit: 21000000000n,
        aggregator: { name: 'CloberV2' } as any,
        transaction: undefined,
      },
    ],
    prices: {
      ['0x0000000000000000000000000000000000000000']: 3000,
      ['0x0000000000000000000000000000000000000003']: 1,
    },
    outputCurrency: {
      address: '0x0000000000000000000000000000000000000003',
      name: 'USDC',
      symbol: 'USDC',
      decimals: 6,
    },
    aggregatorNames: ['Uniswap', 'CloberV2'],
  },
}

export const Null: Story = {
  args: {
    quotes: [],
    prices: {
      ['0x0000000000000000000000000000000000000000']: 3000,
      ['0x0000000000000000000000000000000000000003']: 1,
    },
    outputCurrency: {
      address: '0x0000000000000000000000000000000000000003',
      name: 'USDC',
      symbol: 'USDC',
      decimals: 6,
    },
    aggregatorNames: ['Uniswap', 'CloberV2'],
  },
}

// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString()
}
