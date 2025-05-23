import React, { useMemo } from 'react'

import { Quote } from '../model/aggregator/quote'
import { Currency } from '../model/currency'

import { SwapRoute } from './swap-router'

export const SwapRouteList = ({
  quotes,
  bestQuote,
  outputCurrency,
  aggregatorNames,
}: {
  quotes: Quote[]
  bestQuote: Quote | null
  outputCurrency: Currency | undefined
  aggregatorNames: string[]
}) => {
  const quotesWithoutBestQuote = useMemo(
    () =>
      quotes.filter(
        (quote) => quote.aggregator.name !== (bestQuote?.aggregator.name ?? ''),
      ) as Quote[],
    [quotes, bestQuote],
  )
  return (
    <div className="flex flex-col p-4 gap-2.5 sm:gap-3">
      {bestQuote && quotes.length > 0
        ? [bestQuote, ...quotesWithoutBestQuote].map((quote, index) => (
            <SwapRoute
              quote={quote}
              key={index}
              isBestQuote={quote.aggregator.name === bestQuote.aggregator.name}
              priceDifference={
                100 *
                ((Number(quote.amountOut) - Number(bestQuote.amountOut)) /
                  Number(bestQuote.amountOut))
              }
              outputCurrency={outputCurrency}
              aggregatorName={quote.aggregator.name}
            />
          ))
        : aggregatorNames.map((name) => (
            <SwapRoute
              quote={undefined}
              key={name}
              isBestQuote={false}
              priceDifference={0}
              outputCurrency={outputCurrency}
              aggregatorName={name}
            />
          ))}
    </div>
  )
}
