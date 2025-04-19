import { formatPrice, getQuoteToken, getSubgraphEndpoint } from '@clober/v2-sdk'
import { getAddress, isAddressEqual, PublicClient, zeroAddress } from 'viem'
import { getCurrentTimestamp } from 'hardhat/internal/hardhat-network/provider/utils/getCurrentTimestamp'

import { Subgraph } from '../model/subgraph'
import { ERC20_PERMIT_ABI } from '../abis/@openzeppelin/erc20-permit-abi'
import { Prices } from '../model/prices'
import { formatUnits } from '../utils/bigint'
import { Market } from '../model/market'
import { Chain } from '../model/chain'

type TokenDto = {
  id: string
  decimals: string
  name: string
  symbol: string
}

type BookDto = {
  id: string
  quote: {
    id: string
    decimals: string
    name: string
    symbol: string
  }
  base: {
    id: string
    decimals: string
    name: string
    symbol: string
  }
  depths: {
    price: string
    quoteAmount: string
    baseAmount: string
  }[]
  latestPrice: string
  latestTimestamp: string
  createAt: string
}

let totalSupplyMap: {
  [address: `0x${string}`]: bigint
} = {
  [zeroAddress]: 120_000_000n * 1000000000000000000n, // DEV: 120M for ETH,
}

export const fetchAllMarkets = async (
  publicClient: PublicClient,
  chain: Chain,
  prices: Prices,
  verifiedTokenAddresses: `0x${string}`[],
  prevMarkets: Market[],
): Promise<Market[]> => {
  if (Object.keys(prices).length === 0) {
    return [] as Market[]
  }

  const currentTimestampInSeconds = getCurrentTimestamp()
  const dailyNormalizedCurrentTimestampInSeconds =
    currentTimestampInSeconds - (currentTimestampInSeconds % (24 * 60 * 60))

  const endpoint = getSubgraphEndpoint({ chainId: chain.id })
  const {
    data: { tokens },
  } = await Subgraph.get<{
    data: {
      tokens: TokenDto[]
    }
  }>(
    endpoint,
    'getTokens',
    'query getTokens { tokens(first: 1000) { id name symbol decimals } }',
    {},
  )

  const tokenAddresses = [
    ...new Set([
      ...verifiedTokenAddresses.map((address) => getAddress(address)),
      ...tokens.map((token) => getAddress(token.id)),
    ]),
  ]
  const {
    data: { books },
  } = await Subgraph.get<{
    data: {
      books: BookDto[]
    }
  }>(
    endpoint,
    'getMarkets',
    'query getMarkets($baseAddresses: [String!], $quoteAddresses: [String!]) { books( first: 1000 where: {and: [{base_in: $baseAddresses}, {quote_in: $quoteAddresses}]} ) { id base { id decimals name symbol } quote { id decimals name symbol } depths(orderBy: tick, orderDirection: desc) { price baseAmount quoteAmount } latestPrice latestTimestamp createAt } }',
    {
      baseAddresses: tokenAddresses.map((address) => address.toLowerCase()),
      quoteAddresses: tokenAddresses.map((address) => address.toLowerCase()),
    },
  )

  const _tokenAddresses = tokenAddresses
    .filter((address) => !isAddressEqual(address, zeroAddress))
    .filter(
      (address) =>
        !Object.keys(totalSupplyMap)
          .map((a) => getAddress(a))
          .includes(getAddress(address)),
    )
  const totalSupplies = await publicClient.multicall({
    contracts: _tokenAddresses.map((address) => ({
      address,
      abi: ERC20_PERMIT_ABI,
      functionName: 'totalSupply',
    })),
  })

  totalSupplyMap = _tokenAddresses
    .map((address, index) => [address, totalSupplies[index]] as const)
    .reduce((acc, [address, result]) => {
      acc[getAddress(address as string)] = (result?.result as bigint) ?? 0n
      return acc
    }, totalSupplyMap)

  const marketCodes = books
    .map((book) => {
      const quoteAddress = getAddress(book.quote.id)
      if (
        isAddressEqual(
          quoteAddress,
          getQuoteToken({
            chainId: chain.id,
            token0: getAddress(book.base.id),
            token1: getAddress(book.quote.id),
          }),
        )
      ) {
        return `${book.base.id.toLowerCase()}/${book.quote.id.toLowerCase()}-1d-${dailyNormalizedCurrentTimestampInSeconds}`
      }
      return null
    })
    .filter((code) => code !== null) as string[]

  const {
    data: { chartLogs },
  } = await Subgraph.get<{
    data: {
      chartLogs: {
        id: string
        marketCode: string
        close: string
        open: string
        baseVolume: string
      }[]
    }
  }>(
    endpoint,
    'getChartLogs',
    'query getChartLogs($marketCodes: [ID!]) { chartLogs( orderBy: timestamp orderDirection: desc where: {id_in: $marketCodes} ) { marketCode id close open baseVolume } }',
    {
      marketCodes,
    },
  )

  return books
    .map((book) => {
      if (
        // only bid book
        isAddressEqual(
          getAddress(book.quote.id),
          getQuoteToken({
            chainId: chain.id,
            token0: getAddress(book.base.id),
            token1: getAddress(book.quote.id),
          }),
        ) &&
        book.depths.length > 0
      ) {
        const chartLog = chartLogs.find(
          (log) =>
            `${book.base.id.toLowerCase()}/${book.quote.id.toLowerCase()}` ===
            log.marketCode,
        )
        const latestPrice = Number(
          formatPrice(
            BigInt(book.latestPrice),
            Number(book.quote.decimals),
            Number(book.base.decimals),
          ),
        )
        const quotePrice = prices[getAddress(book.quote.id)] ?? 0
        const basePrice = prices[getAddress(book.base.id)] ?? 0
        const totalSupply = totalSupplyMap[getAddress(book.base.id)] ?? 0n
        if (totalSupply === 0n) {
          return null
        }
        const liquidityUsdInBidBook =
          book.depths.reduce(
            (acc, depth) =>
              acc +
              Number(
                formatUnits(
                  BigInt(depth.quoteAmount),
                  Number(book.quote.decimals) ?? 0n,
                ),
              ),
            0,
          ) * quotePrice
        const askBook = books.find(
          (b) =>
            isAddressEqual(getAddress(b.quote.id), getAddress(book.base.id)) &&
            isAddressEqual(getAddress(b.base.id), getAddress(book.quote.id)),
        )
        const liquidityUsdInAskBook = askBook
          ? askBook.depths.reduce(
              (acc, depth) =>
                acc +
                Number(
                  formatUnits(
                    BigInt(depth.baseAmount),
                    Number(askBook.base.decimals) ?? 0n,
                  ),
                ),
              0,
            ) * basePrice
          : 0

        const bidSideUpdatedAt = Number(book.latestTimestamp)
        const askSideUpdatedAt = Number(askBook?.latestTimestamp) || 0
        const prevMarket = prevMarkets.find(
          (market) =>
            isAddressEqual(
              market.baseCurrency.address,
              getAddress(book.base.id),
            ) &&
            isAddressEqual(
              market.quoteCurrency.address,
              getAddress(book.quote.id),
            ),
        )
        return {
          baseCurrency: isAddressEqual(getAddress(book.base.id), zeroAddress)
            ? { ...chain.nativeCurrency, address: zeroAddress }
            : {
                address: getAddress(book.base.id),
                decimals: Number(book.base.decimals),
                name: book.base.name,
                symbol: book.base.symbol,
              },
          quoteCurrency: isAddressEqual(getAddress(book.quote.id), zeroAddress)
            ? { ...chain.nativeCurrency, address: zeroAddress }
            : {
                address: getAddress(book.quote.id),
                decimals: Number(book.quote.decimals),
                name: book.quote.name,
                symbol: book.quote.symbol,
              },
          createAt: Number(book.createAt),
          bidSideUpdatedAt: Number(book.latestTimestamp),
          isBidTaken:
            bidSideUpdatedAt -
              (prevMarket?.bidSideUpdatedAt || currentTimestampInSeconds) >
            0,
          askSideUpdatedAt: Number(askBook?.latestTimestamp) || 0,
          isAskTaken:
            askSideUpdatedAt -
              (prevMarket?.askSideUpdatedAt || currentTimestampInSeconds) >
            0,
          price: latestPrice,
          dailyVolume:
            Number(chartLog?.baseVolume ?? 0) * (basePrice || latestPrice),
          fdv:
            Number(formatUnits(totalSupply, Number(book.base.decimals) ?? 0n)) *
            (basePrice || latestPrice),
          liquidityUsd: liquidityUsdInBidBook + liquidityUsdInAskBook,
          dailyChange:
            chartLog && chartLog.open && Number(chartLog.open) > 0
              ? (latestPrice / Number(chartLog.open) - 1) * 100
              : 0,
          verified:
            verifiedTokenAddresses
              .map((address) => getAddress(address))
              .includes(getAddress(book.base.id)) &&
            verifiedTokenAddresses
              .map((address) => getAddress(address))
              .includes(getAddress(book.quote.id)),
        }
      }
      return null
    })
    .filter((market) => market !== null) as Market[]
}
