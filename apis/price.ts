import { CHAIN_IDS, getQuoteToken } from '@clober/v2-sdk'
import { getAddress, isAddressEqual, parseUnits } from 'viem'
import BigNumber from 'bignumber.js'
import { EvmPriceServiceConnection, PriceFeed } from '@pythnetwork/pyth-evm-js'

import { AGGREGATORS } from '../constants/aggregators'
import { formatUnits } from '../utils/bigint'
import { Currency } from '../model/currency'
import { Prices } from '../model/prices'
import { PYTH_HERMES_ENDPOINT } from '../constants/pyth'

import { fetchQuotes } from './swap/quote'

export const fetchPrice = async (
  chainId: CHAIN_IDS,
  currency0: Currency,
  currency1: Currency,
): Promise<BigNumber> => {
  const quoteToken = getQuoteToken({
    chainId: chainId,
    token0: currency0.address,
    token1: currency1.address,
  })
  const [quoteCurrency, baseCurrency] = isAddressEqual(
    quoteToken,
    currency0.address,
  )
    ? [currency0, currency1]
    : [currency1, currency0]
  try {
    const { amountOut } = await fetchQuotes(
      AGGREGATORS,
      baseCurrency,
      parseUnits('1', baseCurrency.decimals),
      quoteCurrency,
      20,
      1000n, // arbitrary gas price
    )
    return new BigNumber(formatUnits(amountOut, quoteCurrency.decimals))
  } catch (e) {
    console.error(e)
    return new BigNumber(0)
  }
}

export const fetchPricesFromPyth = async (
  chainId: CHAIN_IDS,
  priceFeedIdList: {
    priceFeedId: `0x${string}`
    address: `0x${string}`
  }[],
): Promise<Prices> => {
  priceFeedIdList = priceFeedIdList.filter(
    ({ address }, index, self) =>
      index ===
      self.findIndex(({ address: _address }) =>
        isAddressEqual(_address as `0x${string}`, address as `0x${string}`),
      ),
  )
  if (priceFeedIdList.length === 0) {
    return {} as Prices
  }
  const pythPriceService = new EvmPriceServiceConnection(
    PYTH_HERMES_ENDPOINT[chainId],
  )
  const prices: PriceFeed[] | undefined =
    await pythPriceService.getLatestPriceFeeds(
      priceFeedIdList.map((id) => id.priceFeedId),
    )
  if (prices === undefined) {
    return {}
  }
  return prices.reduce((acc, priceFeed, index) => {
    const price = priceFeed.getPriceUnchecked()
    const key = priceFeedIdList[index]
    return {
      ...acc,
      [key.address.toLowerCase()]: price.getPriceAsNumberUnchecked(),
      [getAddress(key.address.toLowerCase())]:
        price.getPriceAsNumberUnchecked(),
    }
  }, {} as Prices)
}
