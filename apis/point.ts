import { CHAIN_IDS } from '@clober/v2-sdk'
import { getAddress } from 'viem'
import BigNumber from 'bignumber.js'

import { Subgraph } from '../model/subgraph'
import {
  LIQUIDITY_VAULT_POINT_PER_SECOND,
  LIQUIDITY_VAULT_POINT_START_AT,
  LIQUIDITY_VAULT_POINT_SUBGRAPH_ENDPOINT,
} from '../constants/point'
import { currentTimestampInSeconds } from '../utils/date'
import { formatUnits } from '../utils/bigint'
import { LiquidityVaultPoint } from '../model/liquidity-vault-point'

export async function fetchLiquidVaultPoints(
  chainId: CHAIN_IDS,
): Promise<LiquidityVaultPoint[]> {
  const {
    data: { users },
  } = await Subgraph.get<{
    data: {
      users: {
        id: string
        vaultBalances: {
          amount: string
          updatedAt: string
          pool: { id: string }
        }[]
        accumulatedPoints: string
      }[]
    }
  }>(
    LIQUIDITY_VAULT_POINT_SUBGRAPH_ENDPOINT[chainId]!,
    'getPoints',
    'query getPoints { users { id vaultBalances { amount pool { id } updatedAt } accumulatedPoints } }',
    {},
  )
  const now = currentTimestampInSeconds()
  return users
    .map((user) => {
      return {
        userAddress: getAddress(user.id),
        vaultBalances: user.vaultBalances.map((vaultBalance) => {
          return {
            vaultKey: vaultBalance.pool.id as `0x${string}`,
            balance: Number(formatUnits(BigInt(vaultBalance.amount), 18)),
          }
        }),
        point: user.vaultBalances.reduce((acc, vaultBalance) => {
          const startedAt =
            LIQUIDITY_VAULT_POINT_START_AT?.[chainId]?.[vaultBalance.pool.id] ??
            0
          const pointsPerSecond =
            LIQUIDITY_VAULT_POINT_PER_SECOND?.[chainId]?.[
              vaultBalance.pool.id
            ] ?? 0
          if (startedAt === 0 || pointsPerSecond === 0 || startedAt > now) {
            console.error(`Invalid point data`, {
              chainId,
              vaultKey: vaultBalance.pool.id,
            })
            return acc
          }
          const timeDelta =
            now - Math.max(Number(vaultBalance.updatedAt), startedAt)
          const point = new BigNumber(vaultBalance.amount)
            .times(timeDelta)
            .times(pointsPerSecond)
            .div(1000000000000000000)
            .toNumber()
          return acc + point
        }, Number(user.accumulatedPoints)),
      }
    })
    .sort((a, b) => b.point - a.point)
    .map((user, index) => {
      return {
        ...user,
        rank: index + 1,
      }
    })
}
