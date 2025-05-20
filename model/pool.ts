import {
  Pool as SdkPool,
  PoolSnapshot as SdkPoolSnapshot,
} from '@clober/v2-sdk'

export type Pool = { lpPriceUSD: number; apy: number; tvl: number } & SdkPool

export type PoolSnapshot = { apy: number } & SdkPoolSnapshot
