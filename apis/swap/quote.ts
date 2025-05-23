import { Transaction } from '@clober/v2-sdk'

import { Currency } from '../../model/currency'
import { Aggregator } from '../../model/aggregator'

type QuoteResponse = {
  amountIn: bigint
  amountOut: bigint
  gasLimit: bigint
  aggregator: Aggregator
  transaction: Transaction | undefined
}

export async function fetchQuotes(
  aggregators: Aggregator[],
  inputCurrency: Currency,
  amountIn: bigint,
  outputCurrency: Currency,
  slippageLimitPercent: number,
  gasPrice: bigint,
  userAddress?: `0x${string}`,
): Promise<{ best: QuoteResponse; all: QuoteResponse[] }> {
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
  return {
    best: { amountIn, ...bestQuote },
    all: quotes.map((quote) => ({ amountIn, ...quote })),
  }
}
