import React from 'react'
import { getAddress, zeroAddress } from 'viem'

import { Quote } from '../model/aggregator/quote'
import { Prices } from '../model/prices'
import { Currency } from '../model/currency'
import { toCommaSeparated } from '../utils/number'
import { formatUnits } from '../utils/bigint'

import { GasSvg } from './svg/gas-svg'

export const SwapRoute = ({
  quote,
  isBestQuote,
  priceDifference,
  prices,
  outputCurrency,
  aggregatorName,
}: {
  quote: Quote | undefined
  isBestQuote: boolean
  priceDifference: number
  prices: Prices
  outputCurrency: Currency | undefined
  aggregatorName: string
}) => {
  const [gasUsd, outputUsdWithGasFees] = React.useMemo(() => {
    if (!outputCurrency) {
      return [0, 0]
    }
    const gasUsd =
      Number(formatUnits(quote?.gasLimit ?? 0n, 18)) *
      (prices[getAddress(zeroAddress)] ?? 0)
    const outputUsd =
      Number(formatUnits(quote?.amountOut ?? 0n, outputCurrency.decimals)) *
      (prices[getAddress(outputCurrency.address)] ?? 0)
    return [gasUsd, outputUsd - gasUsd]
  }, [quote, prices, outputCurrency])

  return (
    <div
      className={`text-white w-full self-stretch px-3.5 sm:px-4 py-3 bg-[#e5eaff]/5 rounded-xl flex flex-col justify-start items-start gap-1.5 sm:gap-3 ${quote && isBestQuote ? 'outline outline-[1.20px] outline-offset-[-1.20px] outline-blue-400/80' : ''}`}
    >
      <div className="self-stretch flex justify-start items-start gap-1">
        <div className="self-stretch inline-flex justify-start items-center gap-1.5">
          {quote && outputCurrency ? (
            <div className="justify-start text-white text-sm sm:text-base font-semibold">
              {toCommaSeparated(
                formatUnits(quote?.amountOut ?? 0n, outputCurrency.decimals),
              )}
            </div>
          ) : (
            <div className="w-[70px] h-4 rounded animate-pulse bg-gray-500" />
          )}
          <div className="justify-start text-gray-400 text-sm sm:text-base font-semibold">
            {outputCurrency?.symbol ?? ''}
          </div>
        </div>
        <div className="flex ml-auto">
          {quote ? (
            isBestQuote ? (
              <div className="px-[7px] sm:px-2 py-[3px] sm:py-1 bg-blue-500/25 rounded-2xl inline-flex justify-center items-center gap-2.5">
                <div className="justify-start text-blue-400 text-xs sm:text-sm font-semibold">
                  Best
                </div>
              </div>
            ) : (
              <div className="px-[7px] sm:px-2 py-[3px] sm:py-1 bg-red-400/10 rounded-2xl inline-flex justify-center items-center gap-2.5">
                <div className="justify-start text-red-400 text-xs sm:text-sm font-semibold">
                  {priceDifference.toFixed(2)}%
                </div>
              </div>
            )
          ) : (
            <div className="w-[70px] h-4 rounded animate-pulse bg-gray-500" />
          )}
        </div>
      </div>
      <div className="self-stretch flex flex-col sm:flex-row justify-center sm:justify-start items-start gap-2 sm:gap-3">
        <div className="flex justify-start items-center gap-1.5">
          {quote ? (
            <div className="justify-start text-[#838b99] text-xs sm:text-sm font-medium">
              = ${toCommaSeparated(outputUsdWithGasFees.toFixed(4))}
            </div>
          ) : (
            <div className="w-[70px] h-4 rounded animate-pulse bg-gray-500" />
          )}
          <div className="justify-start text-[#838b99] text-xs sm:text-sm font-medium">
            after gas fees
          </div>
        </div>
        <div className="flex justify-start items-center gap-1.5">
          {quote ? (
            <div className="flex flex-row gap-0.5 items-center justify-start text-[#838b99] text-xs sm:text-sm font-medium">
              <GasSvg /> ${toCommaSeparated(gasUsd.toFixed(6))}
            </div>
          ) : (
            <div className="w-[70px] h-4 rounded animate-pulse bg-gray-500" />
          )}
          <div className="justify-start text-blue-400 text-xs sm:text-sm font-medium">
            via {aggregatorName}
          </div>
        </div>
      </div>
    </div>
  )
}
