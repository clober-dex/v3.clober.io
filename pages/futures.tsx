import React from 'react'

import { FuturesContainer } from '../containers/futures/futures-container'
import RestrictedPageGuard from '../containers/restricted-page-guard'

export default function Futures() {
  return (
    <RestrictedPageGuard>
      <FuturesContainer />
    </RestrictedPageGuard>
  )
}
