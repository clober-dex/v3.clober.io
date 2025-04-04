import React, { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { readContracts } from '@wagmi/core'
import { getContractAddresses } from '@clober/v2-sdk'
import { useAccount } from 'wagmi'

import { Balances } from '../../model/balances'
import { Vault } from '../../model/vault'
import {
  deduplicateCurrencies,
  fetchCurrenciesDone,
} from '../../utils/currency'
import { useChainContext } from '../chain-context'
import { useCurrencyContext } from '../currency-context'
import { WHITELISTED_VAULTS } from '../../constants/vault'
import { wagmiConfig } from '../../constants/chain'
import { fetchVaults } from '../../apis/vault'
import { fetchLiquidVaultPoints } from '../../apis/point'
import { LiquidityVaultPoint } from '../../model/liquidity-vault-point'

type VaultContext = {
  lpCurrencyAmount: string
  setLpCurrencyAmount: (inputCurrencyAmount: string) => void
  currency0Amount: string
  setCurrency0Amount: (inputCurrencyAmount: string) => void
  currency1Amount: string
  setCurrency1Amount: (inputCurrencyAmount: string) => void
  disableSwap: boolean
  setDisableSwap: (value: boolean) => void
  slippageInput: string
  setSlippageInput: (slippageInput: string) => void
  vaultLpBalances: Balances
  vaults: Vault[]
  vaultPoints: LiquidityVaultPoint[]
}

const Context = React.createContext<VaultContext>({
  lpCurrencyAmount: '',
  setLpCurrencyAmount: () => {},
  currency0Amount: '',
  setCurrency0Amount: () => {},
  currency1Amount: '',
  setCurrency1Amount: () => {},
  disableSwap: false,
  setDisableSwap: () => {},
  slippageInput: '1',
  setSlippageInput: () => {},
  vaultLpBalances: {},
  vaults: [],
  vaultPoints: [],
})

export const VaultProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const { selectedChain } = useChainContext()
  const { address: userAddress } = useAccount()
  const { prices, setCurrencies, whitelistCurrencies } = useCurrencyContext()
  const [lpCurrencyAmount, setLpCurrencyAmount] = React.useState('')
  const [currency0Amount, setCurrency0Amount] = React.useState('')
  const [currency1Amount, setCurrency1Amount] = React.useState('')
  const [disableSwap, setDisableSwap] = React.useState(false)
  const [slippageInput, setSlippageInput] = React.useState('1')

  const { data: vaults } = useQuery({
    queryKey: ['vaults', selectedChain.id, Object.keys(prices).length !== 0],
    queryFn: async () => {
      return fetchVaults(selectedChain.id, prices)
    },
    initialData: [],
    refetchInterval: 5 * 1000,
    refetchIntervalInBackground: true,
  }) as {
    data: Vault[]
  }

  const { data: vaultLpBalances } = useQuery({
    queryKey: [
      'vault-lp-balances',
      userAddress,
      selectedChain.id,
      Object.values(prices).reduce((acc, price) => acc + price, 0) !== 0,
    ],
    queryFn: async () => {
      if (!userAddress) {
        return {}
      }
      const results = await readContracts(wagmiConfig, {
        contracts: WHITELISTED_VAULTS[selectedChain.id].map(({ key }) => ({
          chainId: selectedChain.id,
          address: getContractAddresses({ chainId: selectedChain.id })
            .Rebalancer,
          abi: [
            {
              inputs: [
                {
                  internalType: 'address',
                  name: '',
                  type: 'address',
                },
                {
                  internalType: 'uint256',
                  name: '',
                  type: 'uint256',
                },
              ],
              name: 'balanceOf',
              outputs: [
                {
                  internalType: 'uint256',
                  name: '',
                  type: 'uint256',
                },
              ],
              stateMutability: 'view',
              type: 'function',
            },
          ] as const,
          functionName: 'balanceOf',
          args: [userAddress, BigInt(key)],
        })),
      })
      return results.reduce((acc: {}, { result }, index: number) => {
        return {
          ...acc,
          [WHITELISTED_VAULTS[selectedChain.id][index].key]: result ?? 0n,
        }
      }, {})
    },
    refetchInterval: 5 * 1000,
    refetchIntervalInBackground: true,
  }) as {
    data: Balances
  }

  const { data: vaultPoints } = useQuery({
    queryKey: ['vault-points', selectedChain.id],
    queryFn: async () => {
      return fetchLiquidVaultPoints(selectedChain.id)
    },
    initialData: [],
  }) as {
    data: LiquidityVaultPoint[]
  }

  useEffect(() => {
    const action = () => {
      if (!fetchCurrenciesDone(whitelistCurrencies, selectedChain)) {
        return
      }

      setCurrencies(deduplicateCurrencies(whitelistCurrencies))

      const url = new URL(window.location.href)
      window.history.pushState(
        {},
        '',
        `${url.origin}${url.pathname}?chain=${selectedChain.id}`,
      )
    }
    if (window.location.href.includes('/earn')) {
      action()
    }
  }, [selectedChain, setCurrencies, whitelistCurrencies])

  return (
    <Context.Provider
      value={{
        lpCurrencyAmount,
        setLpCurrencyAmount,
        currency0Amount,
        setCurrency0Amount,
        currency1Amount,
        setCurrency1Amount,
        disableSwap,
        setDisableSwap,
        slippageInput,
        setSlippageInput,
        vaultLpBalances: vaultLpBalances ?? {},
        vaults: vaults ?? [],
        vaultPoints: vaultPoints ?? [],
      }}
    >
      {children}
    </Context.Provider>
  )
}

export const useVaultContext = () => React.useContext(Context) as VaultContext
