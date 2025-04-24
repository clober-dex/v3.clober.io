import { StackedLineData } from '../components/chart/vault-performance-chart-model'

import { Currency } from './currency'

export type VaultImmutableInfo = {
  currencyA: Currency
  currencyB: Currency
  salt: `0x${string}`
  key: `0x${string}`
  hasDashboard: boolean
  hasPoint: boolean
  initialLPInfo?: {
    quoteTokenAmount: number
    baseTokenAmount: number
    lpTokenAmount: number
    timestamp: number
    initialPriceMultiplier: number
  }
}

export type Vault = VaultImmutableInfo & {
  lpCurrency: Currency
  lpUsdValue: number
  apy: number
  tvl: number
  volume24h: number
  reserveA: number
  reserveB: number
  totalSupply: number
  historicalPriceIndex: StackedLineData[]
}

export type VaultPosition = {
  vault: Vault
  amount: bigint
  value: number
}
