import React from 'react'

import { Loading } from '../../../components/loading'

export default function PoolManage() {
  // const vaultImmutableInfo = useMemo(
  //   () =>
  //     // WHITELISTED_VAULTS[selectedChain.id].find(
  //     //   (vault) => vault.key === router.query.poolKey,
  //     // ),
  //   [router.query.poolKey, selectedChain.id],
  // )

  // return vaultImmutableInfo ? (
  //   <VaultDashboardContainer vaultImmutableInfo={vaultImmutableInfo} />
  // ) : (
  //   <Loading />
  // )

  return <Loading />
}
