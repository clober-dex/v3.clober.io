import { base } from 'viem/chains'
import { createConfig, http } from 'wagmi'

import { Chain } from '../model/chain'

import { RPC_URL } from './rpc-urls'
import { monadTestnet } from './monad-testnet-chain'
import { riseSepolia } from './rise-sepolia'

export const DEFAULT_CHAIN_ID = base.id

export const supportChains: Chain[] = [
  base,
  {
    ...monadTestnet,
    icon: '/monad.png',
  },
  {
    ...riseSepolia,
    icon: '/rise.svg',
  },
]

export const testnetChainIds: number[] = [monadTestnet.id, riseSepolia.id]

export const findSupportChain = (chainId: number): Chain | undefined =>
  supportChains.find((chain) => chain.id === chainId)

export const wagmiConfig = createConfig({
  chains: supportChains as any,
  transports: Object.fromEntries(
    supportChains.map((chain) => [chain.id, http(RPC_URL[chain.id])]),
  ),
})
