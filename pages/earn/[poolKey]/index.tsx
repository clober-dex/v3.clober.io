import React from 'react'
import { useRouter } from 'next/router'
import { useQuery } from '@tanstack/react-query'

import { VaultManagerContainer } from '../../../containers/vault/vault-manager-container'
import { WHITELISTED_VAULTS } from '../../../constants/vault'
import { useChainContext } from '../../../contexts/chain-context'
import { useCurrencyContext } from '../../../contexts/currency-context'
import { Loading } from '../../../components/loading'

export default function PoolManage() {
  const router = useRouter()
  const { selectedChain } = useChainContext()
  const { prices } = useCurrencyContext()

  const { data: vault } = useQuery({
    queryKey: [
      'vault',
      selectedChain.id,
      router.query.poolKey,
      Object.keys(prices).length !== 0,
    ],
    queryFn: async () => {
      const vaultImmutableInfo = WHITELISTED_VAULTS[selectedChain.id].find(
        (info) => info.key === router.query.poolKey,
      )
      if (!vaultImmutableInfo) {
        return null
      }
      // return fetchOnChainVault(selectedChain, prices, vaultImmutableInfo)
      return null
    },
    initialData: null,
  })

  return vault ? (
    <VaultManagerContainer vault={vault} showDashboard={false} />
  ) : (
    <Loading />
  )
}
