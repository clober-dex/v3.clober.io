import { Transaction } from '@clober/v2-sdk'

import { Currency } from '../../model/currency'
import { Aggregator } from '../../model/aggregator'
import { PathViz } from '../../model/pathviz'

export async function fetchQuotes(
  aggregators: Aggregator[],
  inputCurrency: Currency,
  amountIn: bigint,
  outputCurrency: Currency,
  slippageLimitPercent: number,
  gasPrice: bigint,
  userAddress?: `0x${string}`,
): Promise<{
  amountIn: bigint
  amountOut: bigint
  gasLimit: bigint
  pathViz: PathViz | undefined
  aggregator: Aggregator
  transaction: Transaction | undefined
}> {
  const quotes = (
    await Promise.allSettled(
      aggregators.map((aggregator) =>
        aggregator
          .quote(
            inputCurrency,
            amountIn,
            outputCurrency,
            slippageLimitPercent,
            gasPrice,
            userAddress,
          )
          .catch((error) => {
            console.error(
              `Failed to get quote from ${aggregator.name}: ${error}`,
            )
          }),
      ),
    )
  )
    .map((result) => (result.status === 'fulfilled' ? result.value : undefined))
    .filter(
      (
        quote,
      ): quote is {
        amountOut: bigint
        gasLimit: bigint
        pathViz: PathViz | undefined
        aggregator: Aggregator
        transaction: Transaction | undefined
      } => quote !== undefined,
    )
  if (quotes.length === 0) {
    throw new Error('No quotes available')
  }
  let bestQuote = quotes[0]
  for (const quote of quotes) {
    if (quote.amountOut > bestQuote.amountOut) {
      bestQuote = quote
    }
  }
  return { amountIn, ...bestQuote }
}
