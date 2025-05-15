import React from 'react'

import { Chain } from '../model/chain'
import { CHAIN_CONFIG } from '../chain-configs'

type ChainContext = {
  selectedChain: Chain
}

const Context = React.createContext<ChainContext | null>(null)

export const ChainProvider = ({ children }: React.PropsWithChildren<{}>) => {
  // intentionally kept for future support of multi-chain context
  return (
    <Context.Provider
      value={{
        selectedChain: CHAIN_CONFIG.CHAIN,
      }}
    >
      {children}
    </Context.Provider>
  )
}

export const useChainContext = () => React.useContext(Context) as ChainContext
