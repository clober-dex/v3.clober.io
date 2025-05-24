import React from 'react'

import { PoolContainer } from '../containers/pool/pool-container'
import RestrictedPageGuard from '../containers/restricted-page-guard'

export default function Earn() {
  return (
    <RestrictedPageGuard>
      <PoolContainer />
    </RestrictedPageGuard>
  )
}
