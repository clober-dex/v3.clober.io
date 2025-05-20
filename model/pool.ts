import { Pool as SdkPool } from '@clober/v2-sdk'

export type Pool = { lpPriceUSD: number; apy: number; tvl: number } & SdkPool
