import React, { useMemo } from 'react'

import { Quote } from '../model/aggregator/quote'
import { Prices } from '../model/prices'
import { Currency } from '../model/currency'

import { SwapRoute } from './swap-router'

export const SwapRouteList = ({
  quotes,
  prices,
  outputCurrency,
  aggregatorNames,
}: {
  quotes: Quote[]
  prices: Prices
  outputCurrency: Currency | undefined
  aggregatorNames: string[]
}) => {
  const best = useMemo(() => {
    let best = quotes[0]
    for (const quote of quotes) {
      if (quote.amountOut > best.amountOut) {
        best = quote
      }
    }
    return best
  }, [quotes])
  return (
    <div className="flex flex-col p-4 gap-2.5 sm:gap-3">
      {quotes.length > 0
        ? quotes
            .sort((a, b) => Number(b.amountOut - a.amountOut))
            .map((quote, index) => (
              <SwapRoute
                quote={quote}
                key={index}
                isBestQuote={quote.amountOut === best.amountOut}
                priceDifference={
                  100 *
                  ((Number(quote.amountOut) - Number(best.amountOut)) /
                    Number(best.amountOut))
                }
                prices={prices}
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
              prices={prices}
              outputCurrency={outputCurrency}
              aggregatorName={name}
            />
          ))}
    </div>
  )
}
