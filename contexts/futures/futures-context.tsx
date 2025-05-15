import React, { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'

import { deduplicateCurrencies } from '../../utils/currency'
import { useCurrencyContext } from '../currency-context'
import { useChainContext } from '../chain-context'
import { fetchFuturesPositions } from '../../apis/futures/position'
import { FuturesPosition } from '../../model/futures/futures-position'
import { fetchFuturesAssets } from '../../apis/futures/asset'
import { Asset } from '../../model/futures/asset'

type FuturesContext = {
  assets: Asset[]
  positions: FuturesPosition[]
}

const Context = React.createContext<FuturesContext>({
  assets: [],
  positions: [],
})

export const FuturesProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const { selectedChain } = useChainContext()
  const { prices } = useCurrencyContext()
  const { address: userAddress } = useAccount()
  const { setCurrencies, whitelistCurrencies } = useCurrencyContext()

  const { data: assets } = useQuery({
    queryKey: ['futures-assets', selectedChain.id],
    queryFn: async () => {
      return fetchFuturesAssets()
    },
    initialData: [],
  }) as {
    data: Asset[]
  }

  const { data: positions } = useQuery({
    queryKey: [
      'futures-positions',
      userAddress,
      selectedChain.id,
      Object.keys(prices).length !== 0,
      Object.keys(assets).length !== 0,
    ],
    queryFn: async () => {
      if (
        !userAddress ||
        Object.keys(prices).length === 0 ||
        Object.keys(assets).length === 0
      ) {
        return []
      }
      return fetchFuturesPositions(selectedChain, userAddress, prices, assets)
    },
    initialData: [],
    refetchIntervalInBackground: true,
    refetchInterval: 10 * 1000, // checked
  }) as {
    data: FuturesPosition[]
  }

  useEffect(() => {
    setCurrencies(
      deduplicateCurrencies([
        ...whitelistCurrencies,
        ...assets.map((asset) => asset.currency),
        ...assets.map((asset) => asset.collateral),
      ]),
    )
  }, [assets, setCurrencies, whitelistCurrencies])

  return (
    <Context.Provider
      value={{
        assets,
        positions,
      }}
    >
      {children}
    </Context.Provider>
  )
}

export const useFuturesContext = () =>
  React.useContext(Context) as FuturesContext
