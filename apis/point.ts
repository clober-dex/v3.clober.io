import { CHAIN_IDS } from '@clober/v2-sdk'
import BigNumber from 'bignumber.js'

import { Subgraph } from '../model/subgraph'
import {
  LIQUIDITY_VAULT_POINT_PER_SECOND,
  LIQUIDITY_VAULT_POINT_START_AT,
} from '../constants/point'
import { currentTimestampInSeconds } from '../utils/date'
import { LIQUIDITY_VAULT_POINT_SUBGRAPH_ENDPOINT } from '../constants/subgraph-endpoint'

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
