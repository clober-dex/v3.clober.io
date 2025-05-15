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
import { getReferenceCurrency } from '@clober/v2-sdk'

const CHAIN = {
  ...monadTestnet,
  icon: '/monad.png',
}
export const CHAIN_CONFIG = {
  CHAIN,
  GOOGLE_ANALYTICS_TRACKING_ID: 'G-TE8CSB6JP2',
  RPC_URL:
    'https://proud-tiniest-flower.monad-testnet.quiknode.pro/a4ebe00fca2e7bf01201f3b0f7fe2f0077c52a36',
  REFERENCE_CURRENCY: getReferenceCurrency({ chainId: CHAIN.id }),
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
    chains: [CHAIN],
    transports: {
      [CHAIN.id]: http(CHAIN_CONFIG.RPC_URL),
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
