import React from 'react'

import { DiscoverContainer } from '../containers/discover-container'
import RestrictedPageGuard from '../containers/restricted-page-guard'

export default function Discover() {
  return (
    <RestrictedPageGuard>
      <DiscoverContainer />
    </RestrictedPageGuard>
  )
}
