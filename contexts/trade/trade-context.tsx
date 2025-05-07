import React, { useCallback, useEffect, useRef, useState } from 'react'
import { getAddress, isAddress, isAddressEqual } from 'viem'
import { getQuoteToken } from '@clober/v2-sdk'
import { useAccount, useDisconnect } from 'wagmi'

import { Currency } from '../../model/currency'
import {
  deduplicateCurrencies,
  fetchCurrenciesDone,
  fetchCurrency,
  LOCAL_STORAGE_INPUT_CURRENCY_KEY,
  LOCAL_STORAGE_OUTPUT_CURRENCY_KEY,
} from '../../utils/currency'
import { getQueryParams } from '../../utils/url'
import { DEFAULT_INPUT_CURRENCY } from '../../constants/currency'
import { useChainContext } from '../chain-context'
import { useCurrencyContext } from '../currency-context'

type TradeContext = {
  isBid: boolean
  setIsBid: (isBid: (prevState: boolean) => boolean) => void
  showInputCurrencySelect: boolean
  setShowInputCurrencySelect: (showInputCurrencySelect: boolean) => void
  inputCurrency: Currency | undefined
  setInputCurrency: (currency: Currency | undefined) => void
  inputCurrencyAmount: string
  setInputCurrencyAmount: (amount: string) => void
  showOutputCurrencySelect: boolean
  setShowOutputCurrencySelect: (showOutputCurrencySelect: boolean) => void
  outputCurrency: Currency | undefined
  setOutputCurrency: (currency: Currency | undefined) => void
  outputCurrencyAmount: string
  setOutputCurrencyAmount: (amount: string) => void
  priceInput: string
  setPriceInput: (priceInput: string) => void
  slippageInput: string
  setSlippageInput: (slippage: string) => void
}

const Context = React.createContext<TradeContext>({
  isBid: true,
  setIsBid: () => {},
  showInputCurrencySelect: false,
  setShowInputCurrencySelect: () => {},
  inputCurrency: undefined,
  setInputCurrency: () => {},
  inputCurrencyAmount: '',
  setInputCurrencyAmount: () => {},
  showOutputCurrencySelect: false,
  setShowOutputCurrencySelect: () => {},
  outputCurrency: undefined,
  setOutputCurrency: () => {},
  outputCurrencyAmount: '',
  setOutputCurrencyAmount: () => {},
  priceInput: '',
  setPriceInput: () => {},
  slippageInput: '1',
  setSlippageInput: () => {},
})

export const TRADE_SLIPPAGE_KEY = 'trade-slippage'

export const TradeProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const { disconnectAsync } = useDisconnect()
  const { selectedChain } = useChainContext()
  const previousChain = useRef({
    chain: selectedChain,
  })
  const { chainId } = useAccount()
  const { whitelistCurrencies, setCurrencies } = useCurrencyContext()

  const [isBid, setIsBid] = useState(true)
  const [showInputCurrencySelect, setShowInputCurrencySelect] = useState(false)
  const [inputCurrency, _setInputCurrency] = useState<Currency | undefined>(
    undefined,
  )
  const [inputCurrencyAmount, setInputCurrencyAmount] = useState('')

  const [showOutputCurrencySelect, setShowOutputCurrencySelect] =
    useState(false)
  const [outputCurrency, _setOutputCurrency] = useState<Currency | undefined>(
    undefined,
  )
  const [outputCurrencyAmount, setOutputCurrencyAmount] = useState('')

  const [priceInput, setPriceInput] = useState('')
  const [slippageInput, _setSlippageInput] = useState('1')

  const setInputCurrency = useCallback(
    (currency: Currency | undefined) => {
      currency = currency
        ? {
            ...currency,
            address: getAddress(currency.address),
          }
        : undefined
      if (currency) {
        localStorage.setItem(
          LOCAL_STORAGE_INPUT_CURRENCY_KEY('trade', selectedChain),
          currency.address,
        )
      }
      _setInputCurrency(currency)
    },
    [selectedChain],
  )

  const setOutputCurrency = useCallback(
    (currency: Currency | undefined) => {
      currency = currency
        ? {
            ...currency,
            address: getAddress(currency.address),
          }
        : undefined
      if (currency) {
        localStorage.setItem(
          LOCAL_STORAGE_OUTPUT_CURRENCY_KEY('trade', selectedChain),
          currency.address,
        )
      }
      _setOutputCurrency(currency)
    },
    [selectedChain],
  )

  const [inputCurrencyAddress, outputCurrencyAddress] = [
    getQueryParams()?.inputCurrency ??
      localStorage.getItem(
        LOCAL_STORAGE_INPUT_CURRENCY_KEY('trade', selectedChain),
      ),
    getQueryParams()?.outputCurrency ??
      localStorage.getItem(
        LOCAL_STORAGE_OUTPUT_CURRENCY_KEY('trade', selectedChain),
      ),
  ].map((address) => (isAddress(address) ? getAddress(address) : address))

  const setSlippageInput = useCallback((slippage: string) => {
    localStorage.setItem(TRADE_SLIPPAGE_KEY, slippage)
    _setSlippageInput(slippage)
  }, [])

  useEffect(() => {
    const slippage = localStorage.getItem(TRADE_SLIPPAGE_KEY)
    if (slippage) {
      _setSlippageInput(slippage)
    }
  }, [])

  useEffect(
    () => {
      const action = async () => {
        previousChain.current.chain = selectedChain
        if (
          getQueryParams()?.inputCurrency &&
          getQueryParams()?.outputCurrency &&
          getQueryParams()?.chain
        ) {
          if (chainId && chainId !== selectedChain.id) {
            try {
              await disconnectAsync()
              window.location.reload()
            } catch (e) {
              console.error('disconnectAsync error', e)
            }
          }
        } else if (!fetchCurrenciesDone(whitelistCurrencies, selectedChain)) {
          return
        }
        const _inputCurrency = inputCurrencyAddress
          ? (whitelistCurrencies.find((currency) =>
              isAddressEqual(
                currency.address,
                getAddress(inputCurrencyAddress),
              ),
            ) ??
            (await fetchCurrency(
              selectedChain,
              getAddress(inputCurrencyAddress),
            )))
          : DEFAULT_INPUT_CURRENCY[selectedChain.id]
        const _outputCurrency = outputCurrencyAddress
          ? (whitelistCurrencies.find((currency) =>
              isAddressEqual(
                currency.address,
                getAddress(outputCurrencyAddress),
              ),
            ) ??
            (await fetchCurrency(
              selectedChain,
              getAddress(outputCurrencyAddress),
            )))
          : undefined

        if (previousChain.current.chain.id !== selectedChain.id) {
          return
        }

        if (whitelistCurrencies.length > 0) {
          setCurrencies(
            deduplicateCurrencies(
              [...whitelistCurrencies].concat(
                _inputCurrency ? [_inputCurrency] : [],
                _outputCurrency ? [_outputCurrency] : [],
              ),
            ),
          )
        }

        if (_inputCurrency) {
          setInputCurrency(_inputCurrency)
        }
        if (_outputCurrency) {
          setOutputCurrency(_outputCurrency)
        }

        if (_inputCurrency && _outputCurrency) {
          console.log({
            context: 'trade',
            inputCurrencyAddress,
            inputCurrency: _inputCurrency,
            outputCurrencyAddress,
            outputCurrency: _outputCurrency,
            url: window.location.href,
          })
          const quote = getQuoteToken({
            chainId: selectedChain.id,
            token0: _inputCurrency.address,
            token1: _outputCurrency.address,
          })
          if (isAddressEqual(quote, _inputCurrency.address)) {
            setIsBid(true)
          } else {
            setIsBid(false)
          }
          // remove only `inputCurrency` and `outputCurrency` query params
          const newUrl = new URL(window.location.href)
          newUrl.searchParams.delete('inputCurrency')
          newUrl.searchParams.delete('outputCurrency')
          window.history.pushState({}, '', `${newUrl.pathname}${newUrl.search}`)
        } else {
          setIsBid(true)
        }
      }
      if (window.location.href.includes('/trade')) {
        action()
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      disconnectAsync,
      selectedChain,
      setCurrencies,
      setInputCurrency,
      setOutputCurrency,
      whitelistCurrencies,
      window.location.href,
      inputCurrencyAddress,
      outputCurrencyAddress,
      chainId,
    ],
  )

  return (
    <Context.Provider
      value={{
        isBid,
        setIsBid,
        showInputCurrencySelect,
        setShowInputCurrencySelect,
        inputCurrency,
        setInputCurrency,
        inputCurrencyAmount,
        setInputCurrencyAmount,
        showOutputCurrencySelect,
        setShowOutputCurrencySelect,
        outputCurrency,
        setOutputCurrency,
        outputCurrencyAmount,
        setOutputCurrencyAmount,
        priceInput,
        setPriceInput,
        slippageInput,
        setSlippageInput,
      }}
    >
      {children}
    </Context.Provider>
  )
}

export const useTradeContext = () => React.useContext(Context) as TradeContext
