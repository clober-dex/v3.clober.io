import React, { useMemo } from 'react'
import { useRouter } from 'next/router'

import { VaultDashboardContainer } from '../../../containers/chart/vault-dashboard-container'
import { WHITELISTED_VAULTS } from '../../../constants/vault'
import { useChainContext } from '../../../contexts/chain-context'
import { Loading } from '../../../components/loading'

export default function PoolManage() {
  const router = useRouter()
  const { selectedChain } = useChainContext()
  const vaultImmutableInfo = useMemo(
    () =>
      WHITELISTED_VAULTS[selectedChain.id].find(
        (vault) => vault.key === router.query.poolKey,
      ),
    [router.query.poolKey, selectedChain.id],
  )

  return vaultImmutableInfo ? (
    <VaultDashboardContainer vaultImmutableInfo={vaultImmutableInfo} />
  ) : (
    <Loading />
  )
}
