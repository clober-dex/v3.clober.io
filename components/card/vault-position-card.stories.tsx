import '../../styles/globals.css'
import { Meta, StoryObj } from '@storybook/react'
import { base } from 'viem/chains'

import { VaultPositionCard } from './vault-position-card'

export default {
  title: 'VaultPositionCard',
  component: VaultPositionCard,
  parameters: {
    layout: 'centered',
  },
} as Meta<typeof VaultPositionCard>

type Story = StoryObj<typeof VaultPositionCard>

export const Default: Story = {
  args: {
    chainId: base.id,
    vaultPosition: {
      vault: {
        historicalPriceIndex: [],
        key: '0x',
        lpUsdValue: 12344.3241,
        lpCurrency: {
          address: '0x0000000000000000000000000000000000000003',
          name: 'ETH-USDC-LP',
          symbol: 'ETH-USDC-LP',
          decimals: 18,
        },
        currency0: {
          address: '0x0000000000000000000000000000000000000003',
          name: 'ETH',
          symbol: 'ETH',
          decimals: 18,
        },
        currency1: {
          address: '0x0000000000000000000000000000000000000003',
          name: 'USDC',
          symbol: 'USDC',
          decimals: 6,
        },
        apy: 120.5434,
        tvl: 43123123.0123455,
        volume24h: 123123.123411,
        reserve0: 123123.123411,
        reserve1: 123123.123411,
      },
      amount: BigInt(123123123123),
      value: 123,
    },
  },
}
