import { CHAIN_IDS } from '@clober/v2-sdk'
import { getAddress, isAddressEqual } from 'viem'

import { Subgraph } from '../model/subgraph'
import { FUTURES_SUBGRAPH_ENDPOINT } from '../constants/futures/subgraph-endpoint'
import { Prices } from '../model/prices'
import { formatUnits } from '../utils/bigint'
import { TradingCompetitionPnl } from '../model/trading-competition-pnl'
import { currentTimestampInSeconds } from '../utils/date'

const BLACKLISTED_USER_ADDRESSES = [
  '0x5F79EE8f8fA862E98201120d83c4eC39D9468D49',
  '0xFC5899D93df81CA11583BEE03865b7B13cE093A7',
  '0x605fCbDCba6C99b70A0028593a61CA9205e93739',
].map((address) => getAddress(address))

export const fetchTotalRegisteredUsers = async (
  chainId: CHAIN_IDS,
): Promise<number> => {
  if (!FUTURES_SUBGRAPH_ENDPOINT[chainId]) {
    return 0
  }
  const {
    data: {
      globalState: { totalRegisteredUsers },
    },
  } = await Subgraph.get<{
    data: {
      globalState: { totalRegisteredUsers: string }
    }
  }>(
    FUTURES_SUBGRAPH_ENDPOINT[chainId]!,
    '',
    '{ globalState(id: "state") { totalRegisteredUsers } }',
    {},
  )
  return Number(totalRegisteredUsers)
}

export const fetchUserPnL = async (
  chainId: CHAIN_IDS,
  prices: Prices,
  userAddress: `0x${string}`,
): Promise<TradingCompetitionPnl> => {
  if (!FUTURES_SUBGRAPH_ENDPOINT[chainId]) {
    return { totalPnl: 0, trades: [] }
  }

  const {
    data: { myTrades },
  } = await Subgraph.get<{
    data: {
      myTrades: Array<{
        user: { id: string }
        token: { id: string; decimals: string; name: string; symbol: string }
        realizedPnL: string
        estimatedHolding: string
      }>
    }
  }>(
    FUTURES_SUBGRAPH_ENDPOINT[chainId]!,
    'getTrades',
    'query getTrades($userAddress: String!) { myTrades: trades(where: {user: $userAddress}) { user { id } token { id decimals name symbol } realizedPnL estimatedHolding } }',
    {
      userAddress: userAddress.toLowerCase(),
    },
  )

  return {
    totalPnl: myTrades.reduce((acc, trade) => {
      const token = getAddress(trade.token.id)
      const amount = formatUnits(
        BigInt(trade.estimatedHolding),
        Number(trade.token.decimals),
      )
      const pnl = Number(trade.realizedPnL) + Number(amount) * prices[token]
      return acc + pnl
    }, 0),
    trades: myTrades.map((trade) => {
      const token = getAddress(trade.token.id)
      const amount = formatUnits(
        BigInt(trade.estimatedHolding),
        Number(trade.token.decimals),
      )
      const pnl = Number(trade.realizedPnL) + Number(amount) * prices[token]
      return {
        currency: {
          address: token,
          symbol: trade.token.symbol,
          name: trade.token.name,
          decimals: Number(trade.token.decimals),
        },
        pnl,
        amount: Number(amount),
      }
    }),
  }
}

const cache = new Map<
  string,
  {
    data: {
      [user: `0x${string}`]: TradingCompetitionPnl
    }
    timestamp: number
  }
>()

export const fetchTradingCompetitionLeaderboard = async (
  chainId: CHAIN_IDS,
  prices: Prices,
): Promise<{
  [user: `0x${string}`]: TradingCompetitionPnl
}> => {
  if (!FUTURES_SUBGRAPH_ENDPOINT[chainId]) {
    return {}
  }
  const cacheKey = `${chainId}`
  const cachedData = cache.get(cacheKey)
  if (
    cachedData &&
    Object.keys(prices).length > 0 &&
    cachedData.timestamp > currentTimestampInSeconds() - 60
  ) {
    return cachedData.data
  }
  const {
    data: { users },
  } = await Subgraph.get<{
    data: {
      users: Array<{
        id: string
        pnl: string
        trades: Array<{
          token: { id: string; decimals: string; symbol: string }
          realizedPnL: string
          estimatedHolding: string
        }>
      }>
    }
  }>(
    FUTURES_SUBGRAPH_ENDPOINT[chainId]!,
    'getUsersPnL',
    '{ users( first: 1000 orderBy: pnl orderDirection: desc where: {isRegistered: true} ) { id pnl trades { token { id decimals symbol } realizedPnL estimatedHolding } } }',
    {},
  )
  const results = users
    .filter(
      (user) =>
        !BLACKLISTED_USER_ADDRESSES.some((address) =>
          isAddressEqual(user.id as `0x${string}`, address),
        ),
    )
    .reduce(
      (acc, user) => {
        const userAddress = getAddress(user.id)
        acc[userAddress] = {
          trades: user.trades.map((trade) => {
            const token = getAddress(trade.token.id)
            const amount = formatUnits(
              BigInt(trade.estimatedHolding),
              Number(trade.token.decimals),
            )
            const pnl =
              Number(trade.realizedPnL) + Number(amount) * prices[token]
            return {
              currency: {
                address: token,
                symbol: trade.token.symbol,
                name: trade.token.symbol,
                decimals: Number(trade.token.decimals),
              },
              pnl,
              amount: Number(amount),
            }
          }),
          totalPnl: user.trades.reduce((acc, trade) => {
            const token = getAddress(trade.token.id)
            const amount = formatUnits(
              BigInt(trade.estimatedHolding),
              Number(trade.token.decimals),
            )
            return (
              acc + Number(trade.realizedPnL) + Number(amount) * prices[token]
            )
          }, 0),
        }
        return acc
      },
      {} as { [user: `0x${string}`]: TradingCompetitionPnl },
    )
  cache.set(cacheKey, {
    data: results,
    timestamp: currentTimestampInSeconds(),
  })
  return results
}
