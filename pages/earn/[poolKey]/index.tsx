import React from 'react'
import { useRouter } from 'next/router'
import { useQuery } from '@tanstack/react-query'
import { PoolSnapshot } from '@clober/v2-sdk'

import { PoolManagerContainer } from '../../../containers/vault/pool-manager-container'
import { useChainContext } from '../../../contexts/chain-context'
import { useCurrencyContext } from '../../../contexts/currency-context'
import { Loading } from '../../../components/loading'
import { CHAIN_CONFIG } from '../../../chain-configs'
import { fetchPool } from '../../../apis/pool'
import { Pool } from '../../../model/pool'

export default function PoolManage() {
  const router = useRouter()
  const { selectedChain } = useChainContext()
  const { prices } = useCurrencyContext()

  const { data } = useQuery({
    queryKey: [
      'pool',
      selectedChain.id,
      router.query.poolKey,
      Object.keys(prices).length !== 0,
    ],
    queryFn: async () => {
      if (
        !CHAIN_CONFIG.WHITELISTED_POOL_KEYS.find(
          (key) => key === router.query.poolKey,
        )
      ) {
        return null
      }
      return fetchPool(
        selectedChain,
        prices,
        router.query.poolKey as `0x${string}`,
      )
    },
  }) as {
    data: {
      pool: Pool | null
      poolSnapshot: PoolSnapshot | null
    }
  }

  return data && data.pool && data.poolSnapshot ? (
    <PoolManagerContainer pool={data.pool} poolSnapshot={data.poolSnapshot} />
  ) : (
    <Loading />
  )
}
