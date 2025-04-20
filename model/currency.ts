import { Chain } from './chain'

export type Currency = {
  address: `0x${string}`
  name: string
  symbol: string
  decimals: number
  icon?: string
  isVerified?: boolean
}

export function getLogo(chain: Chain, currency?: Currency): string {
  if (!currency || chain.testnet) {
    return '/unknown.svg'
  }
  if (currency.icon) {
    return currency.icon
  }
  return `https://assets.odos.xyz/tokens/${encodeURIComponent(
    currency.symbol,
  )}.webp`
}
