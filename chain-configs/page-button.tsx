import React from 'react'

import { DiscoverPageSvg } from '../components/svg/discover-page-svg'
import { SwapPageSvg } from '../components/svg/swap-page-svg'
import { EarnPageSvg } from '../components/svg/earn-page-svg'
import { LimitPageSvg } from '../components/svg/limit-page-svg'
import { TradingCompetitionPageSvg } from '../components/svg/trading-competition-page-svg'
import { AnalyticsPageSvg } from '../components/svg/AnalyticsPageSvg'

type PageButton = {
  path: string
  label: string
  icon: React.JSX.Element
  isHiddenMenu: boolean
}

export const PAGE_BUTTONS: PageButton[] = [
  {
    path: '/discover',
    label: 'Discover',
    icon: <DiscoverPageSvg className="w-4 h-4" />,
    isHiddenMenu: false,
  },
  {
    path: '/trade',
    label: 'Trade',
    icon: <SwapPageSvg className="w-4 h-4" />,
    isHiddenMenu: false,
  },
  {
    path: '/earn',
    label: 'Earn',
    icon: <EarnPageSvg className="w-4 h-4" />,
    isHiddenMenu: false,
  },
  {
    path: '/trading-competition',
    label: 'Competition',
    icon: <TradingCompetitionPageSvg className="w-4 h-4" />,
    isHiddenMenu: false,
  },
  {
    path: '/futures',
    label: 'Futures',
    icon: <LimitPageSvg className="w-4 h-4" />,
    isHiddenMenu: true,
  },
  {
    path: '/analytics',
    label: 'Analytics',
    icon: <AnalyticsPageSvg className="w-4 h-4" />,
    isHiddenMenu: true,
  },
  {
    path: '/leaderboard',
    label: 'Leaderboard',
    icon: <TradingCompetitionPageSvg className="w-4 h-4" />,
    isHiddenMenu: true,
  },
]
