import { base, monadTestnet } from 'viem/chains'
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

import { Chain } from '../model/chain'

import { RPC_URL } from './rpc-url'
import { riseSepolia } from './chains/rise-sepolia'

let config: any | null = null

export const supportedChains: Chain[] = [base, monadTestnet, riseSepolia]

export const getChain = (): Chain => {
  const url = window.location.href
  const _monadTestnet: Chain = {
    ...monadTestnet,
    icon: '/monad.png',
  }
  const _riseTestnet: Chain = {
    ...riseSepolia,
    icon: '/rise.png',
  }
  if (url.includes('alpha.clober.io')) {
    return _monadTestnet
  } else if (url.includes('monad-testnet.clober.io')) {
    return _monadTestnet
  } else if (url.includes('base.clober.io')) {
    return base
  } else if (url.includes('rise.clober.io')) {
    return _riseTestnet
  }
  const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? _monadTestnet.id)
  const chain = supportedChains.find((chain) => chain.id === chainId)
  return chain ?? _monadTestnet
}

export const getClientConfig = () => {
  if (typeof window === 'undefined') {
    return null
  }
  if (config) {
    return config
  }

  const chain = getChain()
  config = getDefaultConfig({
    appName: 'Clober',
    projectId: '14e09398dd595b0d1dccabf414ac4531',
    chains: [chain],
    transports: {
      [chain.id]: http(RPC_URL[chain.id]),
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
