import { CHAIN_IDS } from '@clober/v2-sdk'
import BigNumber from 'bignumber.js'
import { getAddress, isAddressEqual } from 'viem'

import { Subgraph } from '../model/subgraph'
import {
  LIQUIDITY_VAULT_POINT_PER_SECOND,
  LIQUIDITY_VAULT_POINT_START_AT,
} from '../constants/point'
import { currentTimestampInSeconds } from '../utils/date'
import { LIQUIDITY_VAULT_POINT_SUBGRAPH_ENDPOINT } from '../constants/subgraph-endpoint'
import { formatUnits } from '../utils/bigint'

const BLACKLISTED_USER_ADDRESSES = [
  '0x5F79EE8f8fA862E98201120d83c4eC39D9468D49',
  '0xCcd0964F534c4583C35e07E47AbE8984A6bB1534',
].map((address) => getAddress(address))

export async function fetchLiquidVaultPoint(
  chainId: CHAIN_IDS,
  userAddress: `0x${string}`,
): Promise<number> {
  if (!LIQUIDITY_VAULT_POINT_SUBGRAPH_ENDPOINT[chainId]) {
    return 0
  }
  const {
    data: { user: liquidityVaultPoint },
  } = await Subgraph.get<{
    data: {
      user: {
        id: string
        vaultBalances: {
          amount: string
          updatedAt: string
          pool: { id: string }
        }[]
        accumulatedPoints: string
      }
    }
  }>(
    LIQUIDITY_VAULT_POINT_SUBGRAPH_ENDPOINT[chainId]!,
    'getPoint',
    'query getPointByUserAddress($userAddress: ID!) { user(id: $userAddress) { id vaultBalances { amount pool { id } updatedAt } accumulatedPoints } }',
    {
      userAddress: userAddress.toLowerCase(),
    },
  )
  const now = currentTimestampInSeconds()
  return liquidityVaultPoint.vaultBalances.reduce((acc, vaultBalance) => {
    const startedAt =
      LIQUIDITY_VAULT_POINT_START_AT?.[chainId]?.[vaultBalance.pool.id] ?? 0
    const pointsPerSecond =
      LIQUIDITY_VAULT_POINT_PER_SECOND?.[chainId]?.[vaultBalance.pool.id] ?? 0
    if (startedAt === 0 || pointsPerSecond === 0 || startedAt > now) {
      return acc
    }
    const timeDelta = now - Math.max(Number(vaultBalance.updatedAt), startedAt)
    const point = new BigNumber(vaultBalance.amount)
      .times(timeDelta)
      .times(pointsPerSecond)
      .div('1000000000000000000')
      .toNumber()
    return acc + point
  }, Number(liquidityVaultPoint.accumulatedPoints))
}

export async function fetchLiquidVaultBalanceLeaderboard(
  chainId: CHAIN_IDS,
): Promise<
  {
    address: `0x${string}`
    balance: number
  }[]
> {
  if (!LIQUIDITY_VAULT_POINT_SUBGRAPH_ENDPOINT[chainId]) {
    return []
  }

  const {
    data: { vaultBalances },
  } = await Subgraph.get<{
    data: {
      vaultBalances: {
        user: {
          id: string
        }
        amount: string
      }[]
    }
  }>(
    LIQUIDITY_VAULT_POINT_SUBGRAPH_ENDPOINT[chainId]!,
    '',
    '{ vaultBalances(first: 1000, where: {pool: "0xad46920833ad7a1ba8e74cc241faf9ae4fd3dc4616ad9648b13160f8453e444f"} orderBy: amount orderDirection: desc) { user { id } amount } }',
    {},
  )

  return vaultBalances
    .filter(
      (vaultBalance) =>
        !BLACKLISTED_USER_ADDRESSES.some((address) =>
          isAddressEqual(getAddress(vaultBalance.user.id), address),
        ),
    )
    .map((vaultBalance) => ({
      address: getAddress(vaultBalance.user.id),
      balance: Number(formatUnits(BigInt(vaultBalance.amount), 18)),
    }))
}
