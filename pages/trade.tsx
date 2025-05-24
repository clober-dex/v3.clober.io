import React from 'react'

import { TradeContainer } from '../containers/trade-container'
import RestrictedPageGuard from '../containers/restricted-page-guard'

export default function Trade() {
  return (
    <RestrictedPageGuard>
      <TradeContainer />
    </RestrictedPageGuard>
  )
}
