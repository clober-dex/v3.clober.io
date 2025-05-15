import { monadTestnet } from 'viem/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { http } from 'viem'
import {
  backpackWallet,
  coinbaseWallet,
  metaMaskWallet,
  phantomWallet,
  rainbowWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets'

import { RPC_URL } from '../constants/rpc-url'

export const CHAIN_CONFIG = {
  CHAIN: {
    ...monadTestnet,
    icon: '/monad.png',
  },
  GOOGLE_ANALYTICS_TRACKING_ID: 'G-TE8CSB6JP2',
}

let config: any | null = null
export const getClientConfig = () => {
  if (typeof window === 'undefined') {
    return null
  }
  if (config) {
    return config
  }

  config = getDefaultConfig({
    appName: 'Clober',
    projectId: '14e09398dd595b0d1dccabf414ac4531',
    chains: [CHAIN_CONFIG.CHAIN],
    transports: {
      [CHAIN_CONFIG.CHAIN.id]: http(RPC_URL[CHAIN_CONFIG.CHAIN.id]),
    },
    wallets: [
      {
        groupName: 'Recommended',
        wallets: [
          backpackWallet,
          metaMaskWallet,
          coinbaseWallet,
          rainbowWallet,
          walletConnectWallet,
          phantomWallet,
        ],
      },
    ],
  })

  return config
}
