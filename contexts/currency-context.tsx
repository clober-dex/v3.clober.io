import React, { useState } from 'react'
import { useAccount } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { getAddress, isAddressEqual, zeroAddress } from 'viem'
import { getBalance, readContracts } from '@wagmi/core'
import { getContractAddresses } from '@clober/v2-sdk'

import { Currency } from '../model/currency'
import { Prices } from '../model/prices'
import { Balances } from '../model/balances'
import { fetchWhitelistCurrencies } from '../apis/currencies'
import { ERC20_PERMIT_ABI } from '../abis/@openzeppelin/erc20-permit-abi'
import { fetchPrices } from '../apis/swap/prices'
import { AGGREGATORS } from '../constants/aggregators'
import { Allowances } from '../model/allowances'
import { wagmiConfig } from '../constants/chain'
import { deduplicateCurrencies } from '../utils/currency'
import { monadTestnet } from '../constants/monad-testnet-chain'
import { CONTRACT_ADDRESSES } from '../constants/future/contracts'
import { fetchPythPrice } from '../apis/price'
import { EXTRA_PRICE_FEED_ID_LIST } from '../constants/currency'
import { riseSepolia } from '../constants/rise-sepolia'

import { useChainContext } from './chain-context'

type CurrencyContext = {
  whitelistCurrencies: Currency[]
  currencies: Currency[]
  setCurrencies: (currencies: Currency[]) => void
  prices: Prices
  balances: Balances
  allowances: Allowances
  isOpenOrderApproved: boolean
}

const Context = React.createContext<CurrencyContext>({
  whitelistCurrencies: [],
  currencies: [],
  setCurrencies: () => {},
  prices: {},
  balances: {},
  allowances: {},
  isOpenOrderApproved: false,
})

const _abi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
    ],
    name: 'isApprovedForAll',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const CurrencyProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const { address: userAddress } = useAccount()
  const { selectedChain } = useChainContext()
  const { data: whitelistCurrencies } = useQuery({
    queryKey: ['currencies', selectedChain.id],
    queryFn: async () => {
      return fetchWhitelistCurrencies(selectedChain.id)
    },
    initialData: [],
  }) as {
    data: Currency[]
  }
  const [currencies, setCurrencies] = useState<Currency[]>([])

  const { data: balances } = useQuery({
    queryKey: [
      'balances',
      selectedChain.id,
      userAddress,
      currencies
        .map((c) => c.address)
        .sort()
        .join(''),
    ],
    queryFn: async () => {
      if (!userAddress || currencies.length === 0) {
        return {}
      }
      const uniqueCurrencies = deduplicateCurrencies(currencies).filter(
        (currency) => !isAddressEqual(currency.address, zeroAddress),
      )
      const [results, balance] = await Promise.all([
        readContracts(wagmiConfig, {
          contracts: uniqueCurrencies.map((currency) => ({
            chainId: selectedChain.id,
            address: currency.address,
            abi: ERC20_PERMIT_ABI,
            functionName: 'balanceOf',
            args: [userAddress],
          })),
        }),
        getBalance(wagmiConfig, {
          address: userAddress,
          chainId: selectedChain.id,
        }),
      ])
      return results.reduce(
        (acc: {}, { result }, index: number) => {
          const currency = uniqueCurrencies[index]
          return {
            ...acc,
            [getAddress(currency.address)]: result ?? 0n,
            [currency.address.toLowerCase()]: result ?? 0n,
          }
        },
        {
          [zeroAddress]: balance?.value ?? 0n,
        },
      )
    },
    refetchInterval: 5 * 1000, // checked
    refetchIntervalInBackground: true,
  }) as {
    data: Balances
  }

  const { data: prices } = useQuery({
    queryKey: ['prices', selectedChain.id],
    queryFn: async () => {
      if (selectedChain.id === monadTestnet.id) {
        const [pythPrices, prices] = await Promise.all([
          fetchPythPrice(
            monadTestnet.id,
            EXTRA_PRICE_FEED_ID_LIST[monadTestnet.id],
          ),
          fetchPrices(AGGREGATORS[selectedChain.id]),
        ])
        return {
          ...prices,
          ...pythPrices,
        } as Prices
      } else if (selectedChain.id === riseSepolia.id) {
        return fetchPythPrice(
          riseSepolia.id,
          EXTRA_PRICE_FEED_ID_LIST[riseSepolia.id],
        )
      }
      return fetchPrices(AGGREGATORS[selectedChain.id])
    },
    refetchInterval: 30 * 1000, // checked
    refetchIntervalInBackground: true,
  })

  const { data } = useQuery({
    queryKey: [
      'allowances',
      selectedChain.id,
      userAddress,
      currencies
        .map((c) => c.address)
        .sort()
        .join(''),
    ],
    queryFn: async () => {
      let spenders: `0x${string}`[] = [
        getContractAddresses({ chainId: selectedChain.id }).Controller,
        getContractAddresses({ chainId: selectedChain.id }).Minter,
        ...AGGREGATORS[selectedChain.id].map(
          (aggregator) => aggregator.contract,
        ),
      ]
      if (
        CONTRACT_ADDRESSES[selectedChain.id] &&
        CONTRACT_ADDRESSES[selectedChain.id]!.VaultManager
      ) {
        spenders = spenders.concat(
          CONTRACT_ADDRESSES[selectedChain.id]!.VaultManager,
        )
      }
      const _currencies = currencies.filter(
        (currency) => !isAddressEqual(currency.address, zeroAddress),
      )
      if (!userAddress || _currencies.length === 0 || !selectedChain) {
        return {
          allowances: {},
          isOpenOrderApproved: false,
        }
      }
      const contracts = [
        ...spenders
          .filter((spender) => !isAddressEqual(spender, zeroAddress))
          .map((spender) => {
            return _currencies.map((currency) => ({
              chainId: selectedChain.id,
              address: currency.address,
              abi: ERC20_PERMIT_ABI,
              functionName: 'allowance',
              args: [userAddress, spender],
            }))
          }, [])
          .flat(),
        {
          chainId: selectedChain.id,
          address: getContractAddresses({ chainId: selectedChain.id })
            .BookManager,
          abi: _abi,
          functionName: 'isApprovedForAll',
          args: [
            userAddress,
            getContractAddresses({ chainId: selectedChain.id }).Controller,
          ],
        },
      ]
      const results = await readContracts(wagmiConfig, {
        contracts,
      })
      return {
        isOpenOrderApproved: results.slice(-1)?.[0]?.result ?? false,
        allowances: results.slice(0, -1).reduce(
          (
            acc: {
              [key in `0x${string}`]: { [key in `0x${string}`]: bigint }
            },
            { result },
            i,
          ) => {
            const currency = _currencies[i % _currencies.length]
            const spender = getAddress(
              spenders[Math.floor(i / _currencies.length)],
            )
            const resultValue = (result ?? 0n) as bigint
            return {
              ...acc,
              [spender]: {
                ...acc[spender],
                [getAddress(currency.address)]: resultValue,
              },
            }
          },
          spenders.reduce((acc, spender) => ({ ...acc, [spender]: {} }), {}),
        ),
      }
    },
  }) as {
    data: { allowances: Allowances; isOpenOrderApproved: boolean }
  }
  if (Object.values(data?.allowances ?? {}).length > 0) {
    console.log('allowances', data)
  }

  return (
    <Context.Provider
      value={{
        whitelistCurrencies,
        prices: prices ?? {},
        balances: balances ?? {},
        allowances: data?.allowances ?? {},
        isOpenOrderApproved: data?.isOpenOrderApproved ?? false,
        currencies,
        setCurrencies,
      }}
    >
      {children}
    </Context.Provider>
  )
}

export const useCurrencyContext = () =>
  React.useContext(Context) as CurrencyContext
