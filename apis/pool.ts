import { getPool, getPoolSnapshot, PoolSnapshot } from '@clober/v2-sdk'
import { zeroHash } from 'viem'

import { Chain } from '../model/chain'
import { Prices } from '../model/prices'
import { Pool } from '../model/pool'

export async function fetchPool(
  chain: Chain,
  prices: Prices,
  poolKey: `0x${string}`,
): Promise<{ pool: Pool; poolSnapshot: PoolSnapshot }> {
  const poolSnapshot = await getPoolSnapshot({
    chainId: chain.id,
    poolKey,
  })
  const pool = await getPool({
    chainId: chain.id,
    token0: poolSnapshot.currencyA.address,
    token1: poolSnapshot.currencyB.address,
    salt: zeroHash,
    options: {
      useSubgraph: true, // doesn't matter since to get pool liquidity, we need to use on-chain call
      // rpcUrl: CHAIN_CONFIG.RPC_URL,
    },
  })
  const tvl =
    Number(pool.liquidityA.total.value) *
      prices[pool.liquidityA.total.currency.address] +
    Number(pool.liquidityB.total.value) *
      prices[pool.liquidityB.total.currency.address]
  return {
    pool: {
      ...pool,
      lpPriceUSD: tvl / Number(pool.totalSupply.value),
      tvl,
      apy: 12.34, // TODO: fix it
    },
    poolSnapshot,
  }
}
