import { getAddress } from 'viem'

import { Prices } from '../../model/prices'
import { Aggregator } from '../../model/aggregator'

export async function fetchPrices(aggregators: Aggregator[]): Promise<Prices> {
  const prices = await Promise.all(
    aggregators.map((aggregator) => aggregator.prices()),
  )
  return prices.reduce((acc, prices) => {
    Object.entries(prices).forEach(([address, price]) => {
      acc[getAddress(address)] = price
    })
    Object.entries(prices).forEach(([address, price]) => {
      acc[address.toLowerCase() as `0x${string}`] = price
    })
    return acc
  }, {} as Prices)
}
