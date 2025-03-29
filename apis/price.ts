import { getQuoteToken } from '@clober/v2-sdk'
import { getAddress, isAddressEqual, parseUnits } from 'viem'
import BigNumber from 'bignumber.js'
import { EvmPriceServiceConnection, PriceFeed } from '@pythnetwork/pyth-evm-js'
import { monadTestnet } from 'viem/chains'

import { AGGREGATORS } from '../constants/aggregators'
import { formatUnits } from '../utils/bigint'
import { Currency } from '../model/currency'
import { Prices } from '../model/prices'

import { fetchQuotes } from './swap/quotes'
import { fetchFutureAssets } from './future/asset'

export const fetchPrice = async (
  chainId: number,
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
      AGGREGATORS[chainId],
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

export const fetchPythPrice = async (
  chainId: number,
  extraPriceFeedIdList: {
    priceFeedId: string
    address: string
  }[],
): Promise<Prices> => {
  const pythPriceService = new EvmPriceServiceConnection(
    'https://hermes.pyth.network',
  )
  const priceFeedIdList = [
    ...(chainId === monadTestnet.id ? await fetchFutureAssets(chainId) : [])
      .map((asset) => [
        {
          priceFeedId: asset.currency.priceFeedId,
          address: asset.currency.address,
        },
        {
          priceFeedId: asset.collateral.priceFeedId,
          address: asset.collateral.address,
        },
      ])
      .flat(),
    ...extraPriceFeedIdList,
  ].filter(
    (priceFeedId, index, self) =>
      index ===
      self.findIndex((t) =>
        isAddressEqual(
          t.address as `0x${string}`,
          priceFeedId.address as `0x${string}`,
        ),
      ),
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
