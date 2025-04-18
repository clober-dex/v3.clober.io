import React, { useCallback, useMemo } from 'react'
import { isAddressEqual, parseUnits } from 'viem'
import BigNumber from 'bignumber.js'

import CurrencyAmountInput from '../input/currency-amount-input'
import { Currency } from '../../model/currency'
import CurrencySelect from '../selector/currency-select'
import { toPlacesAmountString, toPlacesString } from '../../utils/bignumber'
import { ActionButton, ActionButtonProps } from '../button/action-button'
import { Prices } from '../../model/prices'
import { Balances } from '../../model/balances'
import { ExchangeSvg } from '../svg/exchange-svg'
import CloseSvg from '../svg/close-svg'
import { SlippageToggle } from '../toggle/slippage-toggle'
import { Chain } from '../../model/chain'
import { toCommaSeparated } from '../../utils/number'

export const SwapForm = ({
  chain,
  explorerUrl,
  currencies,
  setCurrencies,
  balances,
  prices,
  showInputCurrencySelect,
  setShowInputCurrencySelect,
  inputCurrency,
  setInputCurrency,
  inputCurrencyAmount,
  setInputCurrencyAmount,
  availableInputCurrencyBalance,
  showOutputCurrencySelect,
  setShowOutputCurrencySelect,
  outputCurrency,
  setOutputCurrency,
  outputCurrencyAmount,
  slippageInput,
  setSlippageInput,
  gasEstimateValue,
  priceImpact,
  aggregatorName,
  refreshQuotesAction,
  closeSwapFormAction,
  actionButtonProps,
}: {
  chain: Chain
  explorerUrl: string
  currencies: Currency[]
  setCurrencies: (currencies: Currency[]) => void
  balances: Balances
  prices: Prices
  showInputCurrencySelect: boolean
  setShowInputCurrencySelect:
    | ((showInputCurrencySelect: boolean) => void)
    | undefined
  inputCurrency: Currency | undefined
  setInputCurrency: (inputCurrency: Currency | undefined) => void
  inputCurrencyAmount: string
  setInputCurrencyAmount: (inputCurrencyAmount: string) => void
  availableInputCurrencyBalance: bigint
  showOutputCurrencySelect: boolean
  setShowOutputCurrencySelect:
    | ((showOutputCurrencySelect: boolean) => void)
    | undefined
  outputCurrency: Currency | undefined
  setOutputCurrency: (outputCurrency: Currency | undefined) => void
  outputCurrencyAmount: string
  slippageInput: string
  setSlippageInput: (slippageInput: string) => void
  gasEstimateValue: number
  priceImpact: number
  aggregatorName: string
  refreshQuotesAction: () => void
  closeSwapFormAction: () => void
  actionButtonProps: ActionButtonProps
}) => {
  const isLoadingResults = useMemo(() => {
    return !!(
      inputCurrency &&
      outputCurrency &&
      parseUnits(inputCurrencyAmount, inputCurrency?.decimals ?? 18) > 0n &&
      parseUnits(outputCurrencyAmount, outputCurrency?.decimals ?? 18) === 0n
    )
  }, [inputCurrency, inputCurrencyAmount, outputCurrency, outputCurrencyAmount])

  const swapCurrencies = useCallback(() => {
    const prevInputCurrency = inputCurrency
    setInputCurrency(outputCurrency)
    setOutputCurrency(prevInputCurrency)
    setInputCurrencyAmount('')
  }, [
    inputCurrency,
    outputCurrency,
    setInputCurrency,
    setInputCurrencyAmount,
    setOutputCurrency,
  ])
  const exchangeRate = useMemo(() => {
    const rate = new BigNumber(outputCurrencyAmount).div(inputCurrencyAmount)
    return rate.isNaN() || rate.isZero() ? new BigNumber(0) : rate
  }, [inputCurrencyAmount, outputCurrencyAmount])

  return showInputCurrencySelect ? (
    <CurrencySelect
      chain={chain}
      explorerUrl={explorerUrl}
      currencies={
        outputCurrency
          ? currencies.filter(
              (currency) =>
                !isAddressEqual(currency.address, outputCurrency.address),
            )
          : currencies
      }
      balances={balances}
      prices={prices}
      onBack={() =>
        setShowInputCurrencySelect
          ? setShowInputCurrencySelect(false)
          : undefined
      }
      onCurrencySelect={(currency) => {
        if (setShowInputCurrencySelect) {
          setCurrencies(
            !currencies.find((c) => isAddressEqual(c.address, currency.address))
              ? [...currencies, currency]
              : currencies,
          )
          setInputCurrency(currency)
          setShowInputCurrencySelect(false)
        }
      }}
      defaultBlacklistedCurrency={outputCurrency}
    />
  ) : showOutputCurrencySelect ? (
    <CurrencySelect
      chain={chain}
      explorerUrl={explorerUrl}
      currencies={
        inputCurrency
          ? currencies.filter(
              (currency) =>
                !isAddressEqual(currency.address, inputCurrency.address),
            )
          : currencies
      }
      balances={balances}
      prices={prices}
      onBack={() =>
        setShowOutputCurrencySelect
          ? setShowOutputCurrencySelect(false)
          : undefined
      }
      onCurrencySelect={(currency) => {
        if (setShowOutputCurrencySelect) {
          setCurrencies(
            !currencies.find((c) => isAddressEqual(c.address, currency.address))
              ? [...currencies, currency]
              : currencies,
          )
          setOutputCurrency(currency)
          setShowOutputCurrencySelect(false)
        }
      }}
      defaultBlacklistedCurrency={inputCurrency}
    />
  ) : (
    <div className="flex flex-col gap-5 h-full">
      <div className="flex items-start gap-4 self-stretch">
        <div className="flex flex-row gap-1 items-center h-6 opacity-90 text-white text-base font-semibold">
          Swap {inputCurrency?.symbol ?? ''} &#8594;{' '}
          {outputCurrency?.symbol ?? ''}
        </div>
        <button
          className="flex sm:hidden w-5 h-5 ml-auto"
          onClick={closeSwapFormAction}
        >
          <CloseSvg />
        </button>
      </div>

      <div className="flex flex-col gap-5 self-stretch w-full">
        <div className="flex flex-col gap-5 self-stretch">
          <div className="flex flex-col w-full relative gap-5 self-stretch">
            <div className="flex flex-col w-full gap-2.5 sm:gap-3 self-stretch items-start">
              <div className="flex items-center w-full gap-3 self-stretch text-gray-500 text-xs sm:text-sm font-semibold">
                Pay
                <div className="flex ml-auto mr-2">
                  <button
                    onClick={refreshQuotesAction}
                    className="flex w-4 h-4 sm:w-6 sm:h-6"
                  >
                    <ExchangeSvg className="w-full h-full hover:animate-spin" />
                  </button>
                </div>
              </div>
              <CurrencyAmountInput
                chain={chain}
                currency={inputCurrency}
                value={inputCurrencyAmount}
                onValueChange={setInputCurrencyAmount}
                availableAmount={availableInputCurrencyBalance}
                onCurrencyClick={
                  setShowInputCurrencySelect
                    ? () => setShowInputCurrencySelect(true)
                    : undefined
                }
                price={
                  inputCurrency
                    ? (prices[inputCurrency.address] ?? 0)
                    : undefined
                }
              />
            </div>

            <div className="flex flex-col w-full gap-2.5 sm:gap-3 self-stretch items-start">
              <div className="flex items-center w-full gap-3 self-stretch text-gray-500 text-xs sm:text-sm font-semibold">
                Receive
              </div>
              <CurrencyAmountInput
                chain={chain}
                currency={outputCurrency}
                value={outputCurrencyAmount}
                onValueChange={() => {}}
                availableAmount={0n}
                onCurrencyClick={
                  setShowOutputCurrencySelect
                    ? () => setShowOutputCurrencySelect(true)
                    : undefined
                }
                price={
                  outputCurrency
                    ? (prices[outputCurrency.address] ?? 0)
                    : undefined
                }
                disabled={true}
              />
            </div>

            <div className="absolute flex items-center justify-center top-[56%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-900 p-1 sm:p-1.5">
              <button
                className="flex items-center justify-center p-0 bg-gray-700 w-full h-full rounded-full transform hover:rotate-180 transition duration-300"
                onClick={swapCurrencies}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                >
                  <path
                    d="M4.08335 12.25L4.08335 1.75M4.08335 12.25L2.33335 10.5M4.08335 12.25L5.83335 10.5M8.16669 3.5L9.91669 1.75M9.91669 1.75L11.6667 3.5M9.91669 1.75L9.91669 12.25"
                    stroke="white"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5 mb-1 md:mb-2 text-[13px] sm:text-sm font-medium">
          <div className="flex flex-col items-start gap-3 md:gap-4 self-stretch justify-end text-white text-[13px] sm:text-sm">
            {!chain.testnet ? (
              <div className="flex items-center gap-2 self-stretch">
                <div className="text-gray-400">Price Impact</div>
                <div className="flex ml-auto">
                  <div className="flex relative h-full sm:h-[20px] items-center text-xs sm:text-sm text-white ml-auto">
                    {isLoadingResults ? (
                      <span className="w-[50px] h-full mx-1 rounded animate-pulse bg-gray-500" />
                    ) : (
                      <div
                        className={`text-xs sm:text-sm ${priceImpact < -5 ? 'text-yellow-500' : 'text-white'} flex flex-row gap-0.5 items-center`}
                      >
                        {Number.isNaN(priceImpact)
                          ? 'N/A'
                          : `${priceImpact.toFixed(2)}%`}
                        {priceImpact < -5 && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 16 16"
                            className="fill-yellow-500 stroke-amber-500 w-4 h-4"
                          >
                            <path d="M7.9999 4.16036L12.7918 12.4396H3.20798L7.9999 4.16036ZM8.86533 3.11604C8.48016 2.45076 7.51964 2.45076 7.13448 3.11604L1.86878 12.2113C1.48281 12.878 1.96387 13.7124 2.7342 13.7124H13.2656C14.0359 13.7124 14.517 12.878 14.131 12.2113L8.86533 3.11604Z" />
                            <path d="M8.63628 11.1669C8.63628 10.8154 8.35136 10.5305 7.9999 10.5305C7.64844 10.5305 7.36353 10.8154 7.36353 11.1669C7.36353 11.5184 7.64844 11.8033 7.9999 11.8033C8.35136 11.8033 8.63628 11.5184 8.63628 11.1669Z" />
                            <path d="M8.63628 7.34878C8.63628 6.99732 8.35136 6.7124 7.9999 6.7124C7.64844 6.7124 7.36353 6.99732 7.36353 7.34878V9.25791C7.36353 9.60937 7.64844 9.89429 7.9999 9.89429C8.35136 9.89429 8.63628 9.60937 8.63628 9.25791V7.34878Z" />
                          </svg>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <></>
            )}

            <div className="flex items-center gap-2 self-stretch">
              <div className="text-gray-400">Gas Fee</div>
              <div className="flex ml-auto">
                {!Number.isNaN(gasEstimateValue) ? (
                  <div className="flex relative h-full sm:h-[20px] items-center text-xs sm:text-sm text-white ml-auto">
                    {isLoadingResults ? (
                      <span className="w-[50px] h-full mx-1 rounded animate-pulse bg-gray-500" />
                    ) : (
                      <div className="text-xs sm:text-sm text-gray-400 flex flex-row gap-1 items-center">
                        <span className="text-white">
                          ${toPlacesString(gasEstimateValue)}
                        </span>
                        {aggregatorName.length > 0 ? (
                          <>
                            via
                            <div className="text-gray-400">
                              {aggregatorName}
                            </div>
                          </>
                        ) : (
                          <></>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <></>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch">
              <div className="text-gray-400">Exchange Ratio</div>
              <div className="flex ml-auto">
                {inputCurrency && outputCurrency ? (
                  <div className="flex relative h-full sm:h-[20px] items-center text-xs sm:text-sm text-white ml-auto">
                    {isLoadingResults ? (
                      <span className="w-[50px] h-full mx-1 rounded animate-pulse bg-gray-500" />
                    ) : (
                      <div className="text-xs sm:text-sm text-gray-400 flex flex-row gap-1 items-center">
                        <span className="text-white">
                          1 {inputCurrency.symbol}
                        </span>
                        =
                        <span className="text-white">
                          {toCommaSeparated(toPlacesAmountString(exchangeRate))}{' '}
                          {outputCurrency.symbol}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <></>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 self-stretch">
              <div className="text-gray-400">Max Slippage</div>
              <div className="flex ml-auto">
                <SlippageToggle
                  slippageInput={slippageInput}
                  setSlippageInput={setSlippageInput}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <ActionButton {...actionButtonProps} />
    </div>
  )
}
