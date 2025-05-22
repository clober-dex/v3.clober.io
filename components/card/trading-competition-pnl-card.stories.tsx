import React from 'react'
import '../../styles/globals.css'
import { Meta, StoryObj } from '@storybook/react'
import { zeroAddress } from 'viem'
import { mainnet } from 'viem/chains'

import { TradingCompetitionPnlCard } from './trading-competition-pnl-card'

export default {
  title: 'Card/TradingCompetitionPnlCard',
  component: TradingCompetitionPnlCard,
  parameters: {
    layout: 'centered',
  },
  render: ({ ...args }) => (
    <div className="w-[460px] ">
      <TradingCompetitionPnlCard {...args} />
    </div>
  ),
} as Meta<typeof TradingCompetitionPnlCard>

type Story = StoryObj<typeof TradingCompetitionPnlCard>

export const Default: Story = {
  args: {
    chain: mainnet,
    userAddress: zeroAddress,
    trades: [
      {
        currency: {
          address: '0xDB1Aa7232c2fF7bb480823af254453570d0E4A16',
          symbol: 'TSLA-250516',
          name: 'TSLA-250516',
          decimals: 18,
        },
        pnl: 2.314633725574735,
        amount: 0.05375,
      },
      {
        currency: {
          address: '0xd57e27D90e04eAE2EEcBc63BA28E433098F72855',
          symbol: 'GOOGL-250516',
          name: 'GOOGL-250516',
          decimals: 18,
        },
        pnl: 0.7569791921421132,
        amount: 0.07255,
      },
      {
        currency: {
          address: '0xcaeF04f305313080C2538e585089846017193033',
          symbol: 'USOILSPOT-250516',
          name: 'USOILSPOT-250516',
          decimals: 18,
        },
        pnl: -0.16460743381970744,
        amount: 0.18744,
      },
      {
        currency: {
          address: '0x746e48E2CDD8F6D0B672adAc7810f55658dC801b',
          symbol: 'EUR-250516',
          name: 'EUR-250516',
          decimals: 18,
        },
        pnl: -0.045441905093531076,
        amount: 8.76081,
      },
      {
        currency: {
          address: '0x5F433CFeB6CB2743481a096a56007a175E12ae23',
          symbol: 'BTC-250516',
          name: 'BTC-250516',
          decimals: 18,
        },
        pnl: 1.2108871374987036,
        amount: 0.00014,
      },
      {
        currency: {
          address: '0x53E2BB2d88DdC44CC395a0CbCDDC837AeF44116D',
          symbol: 'AAPL-250516',
          name: 'AAPL-250516',
          decimals: 18,
        },
        pnl: 0.605621922035386,
        amount: 0.0507,
      },
      {
        currency: {
          address: '0x41DF9f8a0c014a0ce398A3F2D1af3164ff0F492A',
          symbol: 'US30Y-250516',
          name: 'US30Y-250516',
          decimals: 18,
        },
        pnl: -0.2633584710466792,
        amount: 3.11436,
      },
      {
        currency: {
          address: '0x24A08695F06A37C8882CD1588442eC40061e597B',
          symbol: 'BRK-A-250516',
          name: 'BRK-A-250516',
          decimals: 18,
        },
        pnl: 0.24355768019377777,
        amount: 0.000014,
      },
    ],
  },
}

// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString()
}
