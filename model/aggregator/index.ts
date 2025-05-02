import { Transaction } from '@clober/v2-sdk'

import { Chain } from '../chain'
import { Currency } from '../currency'
import { Prices } from '../prices'
import { PathViz } from '../pathviz'

export interface Aggregator {
  name: string
  baseUrl: string
  contract: `0x${string}`
  chain: Chain
  currencies(): Promise<Currency[]>
  prices(): Promise<Prices>

  quote(
    inputCurrency: Currency,
    amountIn: bigint,
    outputCurrency: Currency,
    ...args: any[]
  ): Promise<{
    amountOut: bigint
    gasLimit: bigint
    pathViz: PathViz | undefined
    aggregator: Aggregator
    transaction: Transaction | undefined
  }>
}
