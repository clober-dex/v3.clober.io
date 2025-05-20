import {
  Pool as SdkPool,
  PoolSnapshot as SdkPoolSnapshot,
} from '@clober/v2-sdk'

type CurrentState = { lpPriceUSD: number; apy: number; tvl: number }

export type Pool = { current: CurrentState } & SdkPool

export type PoolSnapshot = { current: CurrentState } & SdkPoolSnapshot
