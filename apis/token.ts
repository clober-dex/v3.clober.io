import { createPublicClient, http, isAddressEqual, zeroAddress } from 'viem'
import {
  CHAIN_IDS,
  CHART_LOG_INTERVALS,
  getChartLogs,
  Market,
} from '@clober/v2-sdk'
import { getCurrentTimestamp } from 'hardhat/internal/hardhat-network/provider/utils/getCurrentTimestamp'

import { supportChains } from '../constants/chain'
import { RPC_URL } from '../constants/rpc-urls'
import { ERC20_PERMIT_ABI } from '../abis/@openzeppelin/erc20-permit-abi'
import { DEFAULT_TOKEN_INFO, TokenInfo } from '../model/token-info'
import { formatUnits } from '../utils/bigint'

const buildTotalSupplyCacheKey = (
  chainId: CHAIN_IDS,
  tokenAddress: `0x${string}`,
) => `${chainId}:${tokenAddress}`
const totalSupplyCache = new Map<string, bigint>()
const getTotalSupplyFromCache = (
  chainId: CHAIN_IDS,
  tokenAddress: `0x${string}`,
): bigint | undefined =>
  totalSupplyCache.get(buildTotalSupplyCacheKey(chainId, tokenAddress))
const setTotalSupplyToCache = (
  chainId: CHAIN_IDS,
  tokenAddress: `0x${string}`,
  totalSupply: bigint,
) =>
  totalSupplyCache.set(
    buildTotalSupplyCacheKey(chainId, tokenAddress),
    totalSupply,
  )

export async function fetchTotalSupply(
  chainId: CHAIN_IDS,
  tokenAddress: `0x${string}`,
): Promise<bigint> {
  const cachedTotalSupply = getTotalSupplyFromCache(chainId, tokenAddress)
  if (cachedTotalSupply !== undefined) {
    return cachedTotalSupply
  }
  const totalSupply = await fetchTotalSupplyInner(chainId, tokenAddress)
  setTotalSupplyToCache(chainId, tokenAddress, totalSupply)
  return totalSupply
}

async function fetchTotalSupplyInner(
  chainId: CHAIN_IDS,
  tokenAddress: `0x${string}`,
): Promise<bigint> {
  if (isAddressEqual(tokenAddress, zeroAddress)) {
    return 120_000_000n * 10n ** 18n // DEV: 120M for ETH
  }
  const publicClient = createPublicClient({
    chain: supportChains.find((chain) => chain.id === chainId),
    transport: http(RPC_URL[chainId]),
  })
  return publicClient.readContract({
    address: tokenAddress,
    abi: ERC20_PERMIT_ABI,
    functionName: 'totalSupply',
  })
}

export async function fetchTokenInfoFromOrderBook(
  chainId: CHAIN_IDS,
  selectedMarket: Market,
  quoteValue: number,
): Promise<TokenInfo> {
  const currentTimestampInSeconds = getCurrentTimestamp()
  const [totalSupply, chartLog] = await Promise.all([
    fetchTotalSupply(chainId, selectedMarket.base.address),
    getChartLogs({
      chainId: chainId,
      quote: selectedMarket.quote.address,
      base: selectedMarket.base.address,
      intervalType: CHART_LOG_INTERVALS.fiveMinutes,
      from: currentTimestampInSeconds - 24 * 60 * 60,
      to: currentTimestampInSeconds,
    }),
  ])
  const price = Number(chartLog?.[0]?.close ?? 0)
  const volume = Number(
    (chartLog ?? [])
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, Math.floor((24 * 60) / 5))
      .reduce((acc, { volume }) => acc + Number(volume), 0),
  )
  return {
    ...DEFAULT_TOKEN_INFO,
    volume: {
      ...DEFAULT_TOKEN_INFO.volume,
      h24: volume * price * quoteValue,
    },
    liquidity: {
      ...DEFAULT_TOKEN_INFO.liquidity,
      usd:
        selectedMarket.bids.reduce(
          (acc, { price, baseAmount }) =>
            acc + Number(price) * Number(baseAmount) * quoteValue,
          0,
        ) +
        selectedMarket.asks.reduce(
          (acc, { baseAmount }) => acc + Number(baseAmount),
          0,
        ) *
          price *
          quoteValue,
    },
    priceUsd: price * quoteValue,
    priceNative: price,
    fdv:
      price *
      quoteValue *
      Number(formatUnits(totalSupply, selectedMarket.base.decimals)),
    marketCap:
      price *
      quoteValue *
      Number(formatUnits(totalSupply, selectedMarket.base.decimals)),
  }
}
