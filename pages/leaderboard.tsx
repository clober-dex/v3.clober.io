import React from 'react'

import RedirectIfNotMonadTestnetContainer from '../containers/redirect-if-not-monad-testnet-container'
import { LeaderboardContainer } from '../containers/leaderboard-container'

export default function Leaderboard() {
  return (
    <RedirectIfNotMonadTestnetContainer>
      <LeaderboardContainer />
    </RedirectIfNotMonadTestnetContainer>
  )
}
