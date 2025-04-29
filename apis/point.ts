import { CHAIN_IDS } from '@clober/v2-sdk'
import { getAddress } from 'viem'
import BigNumber from 'bignumber.js'

import { Subgraph } from '../model/subgraph'
import {
  LIQUIDITY_VAULT_POINT_PER_SECOND,
  LIQUIDITY_VAULT_POINT_START_AT,
} from '../constants/point'
import { currentTimestampInSeconds } from '../utils/date'
import { formatUnits } from '../utils/bigint'
import { LiquidityVaultPoint } from '../model/liquidity-vault-point'
import { LIQUIDITY_VAULT_POINT_SUBGRAPH_ENDPOINT } from '../constants/subgraph-endpoint'

type LiquidityVaultPointDto = {
  id: string
  vaultBalances: {
    amount: string
    updatedAt: string
    pool: { id: string }
  }[]
  accumulatedPoints: string
}

const BLACKLISTED_USER_ADDRESSES = [
  '0x5F79EE8f8fA862E98201120d83c4eC39D9468D49',
].map((address) => getAddress(address))

const toLiquidityVaultPoint = (
  chainId: CHAIN_IDS,
  now: number,
  liquidityVaultPoint: LiquidityVaultPointDto,
) => {
  return {
    userAddress: getAddress(liquidityVaultPoint.id),
    vaultBalances: liquidityVaultPoint.vaultBalances.map((vaultBalance) => {
      return {
        vaultKey: vaultBalance.pool.id as `0x${string}`,
        balance: Number(formatUnits(BigInt(vaultBalance.amount), 18)),
      }
    }),
    point: liquidityVaultPoint.vaultBalances.reduce((acc, vaultBalance) => {
      const startedAt =
        LIQUIDITY_VAULT_POINT_START_AT?.[chainId]?.[vaultBalance.pool.id] ?? 0
      const pointsPerSecond =
        LIQUIDITY_VAULT_POINT_PER_SECOND?.[chainId]?.[vaultBalance.pool.id] ?? 0
      if (startedAt === 0 || pointsPerSecond === 0 || startedAt > now) {
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
    }, Number(liquidityVaultPoint.accumulatedPoints)),
  }
}

export async function fetchLiquidVaultPoints(
  chainId: CHAIN_IDS,
): Promise<LiquidityVaultPoint[]> {
  if (!LIQUIDITY_VAULT_POINT_SUBGRAPH_ENDPOINT[chainId]) {
    return []
  }
  const {
    data: { users: liquidityVaultPoints },
  } = await Subgraph.get<{
    data: {
      users: LiquidityVaultPointDto[]
    }
  }>(
    LIQUIDITY_VAULT_POINT_SUBGRAPH_ENDPOINT[chainId]!,
    'getPoints',
    'query getPoints { users (orderBy: accumulatedPoints, orderDirection: desc) { id vaultBalances { amount pool { id } updatedAt } accumulatedPoints } }',
    {},
  )
  const now = currentTimestampInSeconds()
  return liquidityVaultPoints
    .map((liquidityVaultPoint) =>
      toLiquidityVaultPoint(chainId, now, liquidityVaultPoint),
    )
    .filter(
      (liquidityVaultPoint) =>
        !BLACKLISTED_USER_ADDRESSES.includes(
          getAddress(liquidityVaultPoint.userAddress),
        ),
    )
    .sort((a, b) => b.point - a.point)
    .map((liquidityVaultPoint, index) => {
      return {
        ...liquidityVaultPoint,
        rank: index + 1,
      }
    })
}

export async function fetchLiquidVaultPoint(
  chainId: CHAIN_IDS,
  userAddress: `0x${string}`,
): Promise<LiquidityVaultPoint | null> {
  if (!LIQUIDITY_VAULT_POINT_SUBGRAPH_ENDPOINT[chainId]) {
    return null
  }
  const {
    data: { user: liquidityVaultPoint },
  } = await Subgraph.get<{
    data: {
      user: LiquidityVaultPointDto
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
  return toLiquidityVaultPoint(chainId, now, liquidityVaultPoint)
}
