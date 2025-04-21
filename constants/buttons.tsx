import { base, monadTestnet } from 'viem/chains'
import React from 'react'

import { DiscoverPageSvg } from '../components/svg/discover-page-svg'
import { SwapPageSvg } from '../components/svg/swap-page-svg'
import { VaultPageSvg } from '../components/svg/vault-page-svg'
import { LimitPageSvg } from '../components/svg/limit-page-svg'
import { TradingCompetitionPageSvg } from '../components/svg/trading-competition-page-svg'

import { riseSepolia } from './chains/rise-sepolia'

export const PAGE_BUTTONS = [
  {
    path: '/discover',
    label: 'Discover',
    icon: <DiscoverPageSvg className="w-4 h-4" />,
    chains: [monadTestnet.id],
    className: 'hidden sm:flex',
  },
  {
    path: '/trade',
    label: 'Trade',
    icon: <SwapPageSvg className="w-4 h-4" />,
    chains: [base.id, monadTestnet.id, riseSepolia.id],
    className: 'flex',
  },
  {
    path: '/earn',
    label: 'Earn',
    icon: <VaultPageSvg className="w-4 h-4" />,
    chains: [base.id, monadTestnet.id],
    className: 'flex',
  },
  {
    path: '/trading-competition',
    label: 'Competition',
    icon: <TradingCompetitionPageSvg className="w-4 h-4" />,
    chains: [monadTestnet.id],
    className: 'flex',
  },
  {
    path: '/futures',
    label: 'Futures',
    icon: <LimitPageSvg className="w-4 h-4" />,
    chains: [monadTestnet.id],
    className: 'flex',
  },
  {
    path: '/analytics',
    label: 'Analytics',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="17"
        height="16"
        viewBox="0 0 17 16"
        fill="none"
      >
        <path
          d="M8.56634 0C6.18614 0 0.323975 5.6896 0.323975 7.99995C0.323975 10.3103 6.18614 16 8.56634 16C10.9465 16 16.8088 10.3102 16.8088 7.99995C16.8088 5.6897 10.9467 0 8.56634 0ZM7.28192 12.5746C6.2782 12.3092 3.57963 7.7275 3.85319 6.7533C4.12674 5.77905 8.84715 3.15989 9.85082 3.4254C10.8546 3.69087 13.5532 8.27245 13.2796 9.2467C13.0061 10.2209 8.28564 12.8401 7.28192 12.5746Z"
          fill="#6B7280"
        />
      </svg>
    ),
    chains: [monadTestnet.id],
    className: 'flex',
  },
]
