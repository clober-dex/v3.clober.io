import '../../styles/globals.css'
import { Meta, StoryObj } from '@storybook/react'
import { mainnet } from 'viem/chains'
import { zeroHash } from 'viem'

import { PoolCard } from './pool-card'

export default {
  title: 'Card/VaultCard',
  component: PoolCard,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof PoolCard>

type Story = StoryObj<typeof PoolCard>

export const Default: Story = {
  args: {
    chain: mainnet,
    poolSnapshot: {
      totalSupply: 10000,
      historicalPriceIndex: [],
      key: '0x',
      salt: zeroHash,
      hasDashboard: false,
      hasPoint: false,
      lpUsdValue: 12344.3241,
      lpCurrency: {
        address: '0x0000000000000000000000000000000000000003',
        name: 'ETH-USDC-LP',
        symbol: 'ETH-USDC-LP',
        decimals: 18,
      },
      currencyA: {
        address: '0x0000000000000000000000000000000000000003',
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18,
      },
      currencyB: {
        address: '0x0000000000000000000000000000000000000003',
        name: 'USDC',
        symbol: 'USDC',
        decimals: 6,
      },
      apy: 120.5434,
      tvl: 43123123.0123455,
      volume24h: 123123.123411,
      reserveA: 123123.123411,
      reserveB: 123123.123411,
    },
  },
}
