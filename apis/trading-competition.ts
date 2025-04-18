import { CHAIN_IDS } from '@clober/v2-sdk'
import { getAddress, isAddressEqual } from 'viem'

import { Subgraph } from '../model/subgraph'
import { FUTURES_SUBGRAPH_ENDPOINT } from '../constants/futures/subgraph-endpoint'
import { Prices } from '../model/prices'
import { formatUnits } from '../utils/bigint'
import { TradingCompetitionPnl } from '../model/trading-competition-pnl'

const BLACKLISTED_USER_ADDRESSES = [
  '0x5F79EE8f8fA862E98201120d83c4eC39D9468D49',
].map((address) => getAddress(address))

export const fetchTradingCompetitionLeaderboard = async (
  chainId: CHAIN_IDS,
  prices: Prices,
  userAddress?: `0x${string}`,
): Promise<{
  totalRegisteredUsers: number
  userPnL: TradingCompetitionPnl
  allUsersPnL: {
    [user: `0x${string}`]: TradingCompetitionPnl
  }
}> => {
  if (!FUTURES_SUBGRAPH_ENDPOINT[chainId]) {
    return {
      totalRegisteredUsers: 0,
      userPnL: {
        totalPnl: 0,
        trades: [],
      },
      allUsersPnL: {},
    }
  }

  const {
    data: {
      sortedTradesByRealizedPnL,
      sortedTradesByEstimateHolding,
      myTrades,
      globalState: { totalRegisteredUsers },
    },
  } = await Subgraph.get<{
    data: {
      sortedTradesByRealizedPnL: Array<{
        user: { id: string }
        token: { id: string; decimals: string; name: string; symbol: string }
        realizedPnL: string
        estimatedHolding: string
      }>
      sortedTradesByEstimateHolding: Array<{
        user: { id: string }
        token: { id: string; decimals: string; name: string; symbol: string }
        realizedPnL: string
        estimatedHolding: string
      }>
      myTrades: Array<{
        user: { id: string }
        token: { id: string; decimals: string; name: string; symbol: string }
        realizedPnL: string
        estimatedHolding: string
      }>
      globalState: { totalRegisteredUsers: string }
    }
  }>(
    FUTURES_SUBGRAPH_ENDPOINT[chainId]!,
    'getTrades',
    'query getTrades($userAddress: String!) { sortedTradesByRealizedPnL: trades( first: 1000 orderBy: realizedPnL orderDirection: desc where: {user_: {isRegistered: true}} ) { user { id } token { id decimals name symbol } realizedPnL estimatedHolding } sortedTradesByEstimateHolding: trades( first: 1000 orderBy: estimatedHolding orderDirection: desc where: {user_: {isRegistered: true}} ) { user { id } token { id decimals name symbol } realizedPnL estimatedHolding } myTrades: trades(where: {user: $userAddress}) { user { id } token { id decimals name symbol } realizedPnL estimatedHolding } globalState(id: "state") { totalRegisteredUsers } }',
    {
      userAddress: userAddress ? userAddress.toLowerCase() : '',
    },
  )
  const intersectionUsers = [
    ...new Set(
      sortedTradesByRealizedPnL
        .map((trade) => getAddress(trade.user.id))
        .filter((user) =>
          sortedTradesByEstimateHolding.some((trade) =>
            isAddressEqual(getAddress(trade.user.id), getAddress(user)),
          ),
        ),
    ),
  ]
  const trades = intersectionUsers
    .map((user) => {
      return sortedTradesByRealizedPnL
        .filter((trade) =>
          isAddressEqual(getAddress(trade.user.id), getAddress(user)),
        )
        .map((trade) => {
          const token = getAddress(trade.token.id)
          const amount = formatUnits(
            BigInt(trade.estimatedHolding),
            Number(trade.token.decimals),
          )
          return {
            user,
            currency: {
              address: token,
              symbol: trade.token.symbol,
              name: trade.token.name,
              decimals: Number(trade.token.decimals),
            },
            amount: Number(amount),
            pnl: Number(trade.realizedPnL) + Number(amount) * prices[token],
          }
        })
    })
    .flat()

  return {
    totalRegisteredUsers: Number(totalRegisteredUsers),
    userPnL: {
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
    },
    allUsersPnL: trades.reduce(
      (acc, trade) => {
        if (
          BLACKLISTED_USER_ADDRESSES.some((address) =>
            isAddressEqual(getAddress(trade.user), address),
          )
        ) {
          return acc
        }
        const user = getAddress(trade.user)
        if (!acc[user]) {
          acc[user] = {
            totalPnl: 0,
            trades: [],
          }
        }
        acc[user].totalPnl += trade.pnl
        acc[user].trades.push({
          currency: {
            address: trade.currency.address,
            symbol: trade.currency.symbol,
            name: trade.currency.name,
            decimals: trade.currency.decimals,
          },
          pnl: trade.pnl,
          amount: trade.amount,
        })
        return acc
      },
      {} as {
        [user: `0x${string}`]: TradingCompetitionPnl
      },
    ),
  }
}
