import React from 'react'

import { TradingCompetitionContainer } from '../containers/trading-competition-container'
import RestrictedPageGuard from '../containers/restricted-page-guard'

export default function TradingCompetition() {
  return (
    <RestrictedPageGuard>
      <TradingCompetitionContainer />
    </RestrictedPageGuard>
  )
}
