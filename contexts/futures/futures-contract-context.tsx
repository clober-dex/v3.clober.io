import React, { useCallback, useEffect, useMemo } from 'react'
import { useAccount, useDisconnect, useWalletClient } from 'wagmi'
import { useQueryClient } from '@tanstack/react-query'
import {
  BaseError,
  ContractFunctionRevertedError,
  createPublicClient,
  encodeAbiParameters,
  encodeFunctionData,
  getAddress,
  Hash,
  http,
  isAddressEqual,
  parseAbiParameters,
  zeroAddress,
} from 'viem'
import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js'

import { Asset } from '../../model/futures/asset'
import { useCurrencyContext } from '../currency-context'
import {
  Confirmation,
  Transaction,
  useTransactionContext,
} from '../transaction-context'
import { WETH } from '../../constants/currency'
import { maxApprove } from '../../utils/approve20'
import { FUTURES_CONTRACT_ADDRESSES } from '../../constants/futures/contract-addresses'
import { useChainContext } from '../chain-context'
import { formatUnits } from '../../utils/bigint'
import { FUTURES_MARKET_ABI } from '../../abis/futures/futures-market-abi'
import { PYTH_ORACLE_ABI } from '../../abis/futures/pyth-oracle-abi'
import { FuturesPosition } from '../../model/futures/futures-position'
import { buildTransaction, sendTransaction } from '../../utils/transaction'
import { RPC_URL } from '../../constants/rpc-url'
import { currentTimestampInSeconds } from '../../utils/date'
import { Currency } from '../../model/currency'
import { deduplicateCurrencies } from '../../utils/currency'
import { PYTH_HERMES_ENDPOINT } from '../../constants/pyth'
import { toPlacesAmountString } from '../../utils/bignumber'

import { useFuturesContext } from './futures-context'

type FuturesContractContext = {
  isMarketClose: (asset: Asset, debtAmount: bigint) => Promise<boolean>
  borrow: (
    asset: Asset,
    collateralAmount: bigint,
    debtAmount: bigint,
  ) => Promise<Hash | undefined>
  repay: (asset: Asset, debtAmount: bigint) => Promise<Hash | undefined>
  repayAll: (position: FuturesPosition) => Promise<Hash | undefined>
  settle: (asset: Asset) => Promise<Hash | undefined>
  close: (asset: Asset, collateralReceived: bigint) => Promise<Hash | undefined>
  redeem: (
    asset: Asset,
    amount: bigint,
    collateralReceived: bigint,
  ) => Promise<Hash | undefined>
  addCollateral: (asset: Asset, amount: bigint) => Promise<Hash | undefined>
  removeCollateral: (asset: Asset, amount: bigint) => Promise<Hash | undefined>
  pendingPositionCurrencies: Currency[]
}

const Context = React.createContext<FuturesContractContext>({
  borrow: () => Promise.resolve(undefined),
  isMarketClose: () => Promise.resolve(false),
  repay: () => Promise.resolve(undefined),
  repayAll: () => Promise.resolve(undefined),
  settle: () => Promise.resolve(undefined),
  close: () => Promise.resolve(undefined),
  redeem: () => Promise.resolve(undefined),
  addCollateral: () => Promise.resolve(undefined),
  removeCollateral: () => Promise.resolve(undefined),
  pendingPositionCurrencies: [],
})

export const LOCAL_STORAGE_PENDING_POSITIONS_KEY = (address: `0x${string}`) =>
  `pending-futures-positions-currencies-for-${address}`

export const FuturesContractProvider = ({
  children,
}: React.PropsWithChildren<{}>) => {
  const queryClient = useQueryClient()
  const { disconnectAsync } = useDisconnect()

  const { data: walletClient } = useWalletClient()
  const {
    setConfirmation,
    pendingTransactions,
    queuePendingTransaction,
    dequeuePendingTransaction,
    latestSubgraphBlockNumber,
  } = useTransactionContext()
  const { positions } = useFuturesContext()
  const { selectedChain } = useChainContext()
  const { address: userAddress } = useAccount()
  const { allowances, prices, balances } = useCurrencyContext()
  const publicClient = useMemo(() => {
    return createPublicClient({
      chain: selectedChain,
      transport: http(RPC_URL[selectedChain.id]),
    })
  }, [selectedChain])

  const [pendingPositionCurrencies, setPendingPositionCurrencies] =
    React.useState<Currency[]>([])

  const queuePendingPositionCurrency = useCallback(
    (currency: Currency) => {
      if (userAddress) {
        setPendingPositionCurrencies((prev) => {
          const newCurrencies = deduplicateCurrencies([...prev, currency])
          localStorage.setItem(
            LOCAL_STORAGE_PENDING_POSITIONS_KEY(userAddress),
            JSON.stringify(newCurrencies),
          )
          return newCurrencies
        })
      }
    },
    [userAddress],
  )

  const dequeuePendingPositionCurrency = useCallback(
    (currency: Currency) => {
      if (userAddress) {
        setPendingPositionCurrencies((prev) => {
          const newCurrencies = prev.filter(
            (c) => !isAddressEqual(c.address, currency.address),
          )
          localStorage.setItem(
            LOCAL_STORAGE_PENDING_POSITIONS_KEY(userAddress),
            JSON.stringify(newCurrencies),
          )
          return newCurrencies
        })
      }
    },
    [userAddress],
  )

  useEffect(() => {
    setPendingPositionCurrencies(
      userAddress
        ? JSON.parse(
            localStorage.getItem(
              LOCAL_STORAGE_PENDING_POSITIONS_KEY(userAddress),
            ) ?? '[]',
          )
        : [],
    )
  }, [userAddress])

  useEffect(() => {
    if (
      pendingTransactions.length === 0 &&
      pendingPositionCurrencies.length > 0
    ) {
      pendingPositionCurrencies.forEach((currency) => {
        dequeuePendingPositionCurrency(currency)
      })
    }

    pendingTransactions.forEach((transaction) => {
      if (latestSubgraphBlockNumber.chainId !== selectedChain.id) {
        return
      }
      if (!transaction.success) {
        dequeuePendingTransaction(transaction.txHash)
        return
      }
      if (
        latestSubgraphBlockNumber.blockNumber === 0 ||
        transaction.blockNumber > latestSubgraphBlockNumber.blockNumber
      ) {
        if (
          transaction.type === 'close' ||
          transaction.type === 'settle' ||
          transaction.type === 'redeem'
        ) {
          dequeuePendingTransaction(transaction.txHash)
        }
        return
      }

      const debtCurrency = (
        transaction as Transaction & {
          debtCurrency: Currency
        }
      )?.debtCurrency
      if (
        (transaction.type === 'borrow' ||
          transaction.type === 'repay' ||
          transaction.type === 'repay-all' ||
          transaction.type === 'add-collateral' ||
          transaction.type === 'remove-collateral') &&
        debtCurrency
      ) {
        dequeuePendingTransaction(transaction.txHash)
        dequeuePendingPositionCurrency(debtCurrency)
      }
    })
  }, [
    dequeuePendingTransaction,
    pendingTransactions,
    positions,
    balances,
    latestSubgraphBlockNumber,
    dequeuePendingPositionCurrency,
    selectedChain.id,
    pendingPositionCurrencies,
  ])

  const isMarketClose = useCallback(
    async (asset: Asset, debtAmount: bigint): Promise<boolean> => {
      try {
        if (!walletClient) {
          throw new Error('Wallet not connected')
        }
        if (FUTURES_CONTRACT_ADDRESSES[selectedChain.id] === undefined) {
          throw new Error('Contract address not found')
        }

        const evmPriceServiceConnection = new EvmPriceServiceConnection(
          PYTH_HERMES_ENDPOINT[selectedChain.id],
        )
        const priceFeedUpdateData =
          await evmPriceServiceConnection.getPriceFeedsUpdateData([
            asset.currency.priceFeedId,
            asset.collateral.priceFeedId,
          ])

        const fee = await publicClient.readContract({
          address: FUTURES_CONTRACT_ADDRESSES[selectedChain.id]!.PythOracle,
          abi: PYTH_ORACLE_ABI,
          functionName: 'getUpdateFee',
          args: [priceFeedUpdateData as any],
        })

        await publicClient.simulateContract({
          chain: walletClient.chain,
          address: FUTURES_CONTRACT_ADDRESSES[selectedChain.id]!.FuturesMarket,
          functionName: 'multicall',
          abi: FUTURES_MARKET_ABI,
          value: fee,
          args: [
            [
              encodeFunctionData({
                abi: FUTURES_MARKET_ABI,
                functionName: 'updateOracle',
                args: [
                  encodeAbiParameters(parseAbiParameters('bytes[]'), [
                    priceFeedUpdateData as any,
                  ]),
                ],
              }),
              encodeFunctionData({
                abi: FUTURES_MARKET_ABI,
                functionName: 'mint',
                args: [
                  asset.currency.address,
                  walletClient.account.address,
                  debtAmount,
                ],
              }),
            ],
          ],
        })
        return false
      } catch (e) {
        if (e instanceof BaseError) {
          const revertError = e.walk(
            (err) => err instanceof ContractFunctionRevertedError,
          )
          if (revertError instanceof ContractFunctionRevertedError) {
            if (revertError.toString().includes('0x19abf40e')) {
              return true
            }
          }
        }
        return false
      }
    },
    [publicClient, selectedChain.id, walletClient],
  )

  const borrow = useCallback(
    async (
      asset: Asset,
      collateralAmount: bigint,
      debtAmount: bigint,
    ): Promise<Hash | undefined> => {
      if (!walletClient) {
        return
      }
      let isAllowanceChanged = false

      try {
        setConfirmation({
          title: `Mint ${asset.currency.symbol}`,
          body: 'Please confirm in your wallet.',
          chain: selectedChain,
          fields: [],
        })

        const spender =
          FUTURES_CONTRACT_ADDRESSES[selectedChain.id]!.FuturesMarket
        if (
          !isAddressEqual(spender, WETH[selectedChain.id].address) &&
          !isAddressEqual(asset.collateral.address, zeroAddress) &&
          allowances[getAddress(spender)][
            getAddress(asset.collateral.address)
          ] < collateralAmount
        ) {
          const confirmation = {
            title: `Max Approve ${asset.collateral.symbol}`,
            body: 'Please confirm in your wallet.',
            chain: selectedChain,
            fields: [],
          }
          setConfirmation(confirmation)
          const transactionReceipt = await maxApprove(
            selectedChain,
            walletClient,
            asset.collateral,
            spender,
            disconnectAsync,
          )
          if (transactionReceipt) {
            queuePendingTransaction({
              ...confirmation,
              txHash: transactionReceipt.transactionHash,
              success: transactionReceipt.status === 'success',
              blockNumber: Number(transactionReceipt.blockNumber),
              type: 'approve',
              timestamp: currentTimestampInSeconds(),
            })
            isAllowanceChanged = true
          }
        }

        const confirmation = {
          title: `Mint ${asset.currency.symbol}`,
          body: 'Please confirm in your wallet.',
          chain: selectedChain,
          fields: [
            {
              currency: asset.collateral,
              label: asset.collateral.symbol,
              direction: 'in',
              value: toPlacesAmountString(
                formatUnits(collateralAmount, asset.collateral.decimals),
                prices[asset.collateral.address] ?? 0,
              ),
            },
            {
              currency: asset.currency,
              label: asset.currency.symbol,
              direction: 'out',
              value: toPlacesAmountString(
                formatUnits(debtAmount, asset.currency.decimals),
                prices[asset.currency.address] ?? 0,
              ),
            },
          ].filter((field) => field.value !== '0') as any[],
        }
        setConfirmation(confirmation)

        const evmPriceServiceConnection = new EvmPriceServiceConnection(
          PYTH_HERMES_ENDPOINT[selectedChain.id],
        )
        const priceFeedUpdateData =
          await evmPriceServiceConnection.getPriceFeedsUpdateData([
            asset.currency.priceFeedId,
            asset.collateral.priceFeedId,
          ])

        if (priceFeedUpdateData.length === 0) {
          console.error('Price feed not found')
          return
        }

        const fee = await publicClient.readContract({
          address: FUTURES_CONTRACT_ADDRESSES[selectedChain.id]!.PythOracle,
          abi: PYTH_ORACLE_ABI,
          functionName: 'getUpdateFee',
          args: [priceFeedUpdateData as any],
        })

        const transaction = await buildTransaction(
          publicClient,
          {
            chain: selectedChain,
            address: spender,
            functionName: 'multicall',
            abi: FUTURES_MARKET_ABI,
            value: fee,
            args: [
              [
                encodeFunctionData({
                  abi: FUTURES_MARKET_ABI,
                  functionName: 'updateOracle',
                  args: [
                    encodeAbiParameters(parseAbiParameters('bytes[]'), [
                      priceFeedUpdateData as any,
                    ]),
                  ],
                }),
                encodeFunctionData({
                  abi: FUTURES_MARKET_ABI,
                  functionName: 'deposit',
                  args: [
                    asset.currency.address,
                    walletClient.account.address,
                    collateralAmount,
                  ],
                }),
                encodeFunctionData({
                  abi: FUTURES_MARKET_ABI,
                  functionName: 'mint',
                  args: [
                    asset.currency.address,
                    walletClient.account.address,
                    debtAmount,
                  ],
                }),
              ],
            ],
          },
          5_000_000n,
        )
        const transactionReceipt = await sendTransaction(
          selectedChain,
          walletClient,
          transaction,
          disconnectAsync,
        )
        if (transactionReceipt) {
          queuePendingTransaction({
            ...confirmation,
            txHash: transactionReceipt.transactionHash,
            success: transactionReceipt.status === 'success',
            blockNumber: Number(transactionReceipt.blockNumber),
            type: 'borrow',
            timestamp: currentTimestampInSeconds(),
            debtCurrency: asset.currency,
          } as Transaction)
          if (transactionReceipt.status === 'success') {
            queuePendingPositionCurrency(asset.currency)
          }
        }
        return transactionReceipt?.transactionHash
      } catch (e) {
        console.error(e)
      } finally {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['futures-positions'] }),
          queryClient.invalidateQueries({ queryKey: ['balances'] }),
          isAllowanceChanged
            ? queryClient.invalidateQueries({ queryKey: ['allowances'] })
            : undefined,
        ])
        setConfirmation(undefined)
      }
    },
    [
      allowances,
      disconnectAsync,
      prices,
      publicClient,
      queryClient,
      queuePendingPositionCurrency,
      queuePendingTransaction,
      selectedChain,
      setConfirmation,
      walletClient,
    ],
  )

  const repay = useCallback(
    async (asset: Asset, debtAmount: bigint): Promise<Hash | undefined> => {
      if (!walletClient) {
        return
      }

      try {
        setConfirmation({
          title: `Repay ${asset.currency.symbol}`,
          body: 'Please confirm in your wallet.',
          chain: selectedChain,
          fields: [],
        })

        const confirmation = {
          title: `Repay ${asset.currency.symbol}`,
          body: 'Please confirm in your wallet.',
          chain: selectedChain,
          fields: [
            {
              currency: asset.currency,
              label: asset.currency.symbol,
              direction: 'in',
              value: toPlacesAmountString(
                formatUnits(debtAmount, asset.currency.decimals),
                prices[asset.currency.address] ?? 0,
              ),
            },
          ] as Confirmation['fields'],
        }
        setConfirmation(confirmation)

        const transaction = await buildTransaction(
          publicClient,
          {
            chain: selectedChain,
            address:
              FUTURES_CONTRACT_ADDRESSES[selectedChain.id]!.FuturesMarket,
            functionName: 'multicall',
            abi: FUTURES_MARKET_ABI,
            args: [
              [
                encodeFunctionData({
                  abi: FUTURES_MARKET_ABI,
                  functionName: 'burn',
                  args: [
                    asset.currency.address,
                    walletClient.account.address,
                    debtAmount,
                  ],
                }),
              ],
            ],
          },
          5_000_000n,
        )
        const transactionReceipt = await sendTransaction(
          selectedChain,
          walletClient,
          transaction,
          disconnectAsync,
        )
        if (transactionReceipt) {
          queuePendingTransaction({
            ...confirmation,
            txHash: transactionReceipt.transactionHash,
            success: transactionReceipt.status === 'success',
            blockNumber: Number(transactionReceipt.blockNumber),
            type: 'repay',
            timestamp: currentTimestampInSeconds(),
            debtCurrency: asset.currency,
          } as Transaction)
          if (transactionReceipt.status === 'success') {
            queuePendingPositionCurrency(asset.currency)
          }
        }
        return transactionReceipt?.transactionHash
      } catch (e) {
        console.error(e)
      } finally {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['futures-positions'] }),
          queryClient.invalidateQueries({ queryKey: ['balances'] }),
        ])
        setConfirmation(undefined)
      }
    },
    [
      disconnectAsync,
      prices,
      publicClient,
      queryClient,
      queuePendingPositionCurrency,
      queuePendingTransaction,
      selectedChain,
      setConfirmation,
      walletClient,
    ],
  )

  const repayAll = useCallback(
    async (userPosition: FuturesPosition): Promise<Hash | undefined> => {
      if (!walletClient) {
        return
      }

      try {
        setConfirmation({
          title: `Close ${userPosition.asset.currency.symbol}`,
          body: 'Please confirm in your wallet.',
          chain: selectedChain,
          fields: [],
        })

        const confirmation = {
          title: `Close ${userPosition.asset.currency.symbol}`,
          body: 'Please confirm in your wallet.',
          chain: selectedChain,
          fields: [
            {
              currency: userPosition.asset.currency,
              label: userPosition.asset.currency.symbol,
              direction: 'in',
              value: toPlacesAmountString(
                formatUnits(
                  userPosition?.debtAmount ?? 0n,
                  userPosition.asset.currency.decimals,
                ),
                prices[userPosition.asset.currency.address] ?? 0,
              ),
            },
            {
              currency: userPosition.asset.collateral,
              label: userPosition.asset.collateral.symbol,
              direction: 'out',
              value: toPlacesAmountString(
                formatUnits(
                  userPosition?.collateralAmount ?? 0n,
                  userPosition.asset.collateral.decimals,
                ),
                prices[userPosition.asset.collateral.address] ?? 0,
              ),
            },
          ] as Confirmation['fields'],
        }
        setConfirmation(confirmation)

        const evmPriceServiceConnection = new EvmPriceServiceConnection(
          PYTH_HERMES_ENDPOINT[selectedChain.id],
        )
        const priceFeedUpdateData =
          await evmPriceServiceConnection.getPriceFeedsUpdateData([
            userPosition.asset.currency.priceFeedId,
            userPosition.asset.collateral.priceFeedId,
          ])

        if (priceFeedUpdateData.length === 0) {
          console.error('Price feed not found')
          return
        }

        const fee = await publicClient.readContract({
          address: FUTURES_CONTRACT_ADDRESSES[selectedChain.id]!.PythOracle,
          abi: PYTH_ORACLE_ABI,
          functionName: 'getUpdateFee',
          args: [priceFeedUpdateData as any],
        })

        const transaction = await buildTransaction(
          publicClient,
          {
            chain: selectedChain,
            address:
              FUTURES_CONTRACT_ADDRESSES[selectedChain.id]!.FuturesMarket,
            functionName: 'multicall',
            abi: FUTURES_MARKET_ABI,
            value: fee,
            args: [
              [
                encodeFunctionData({
                  abi: FUTURES_MARKET_ABI,
                  functionName: 'updateOracle',
                  args: [
                    encodeAbiParameters(parseAbiParameters('bytes[]'), [
                      priceFeedUpdateData as any,
                    ]),
                  ],
                }),
                encodeFunctionData({
                  abi: FUTURES_MARKET_ABI,
                  functionName: 'burn',
                  args: [
                    userPosition.asset.currency.address,
                    walletClient.account.address,
                    userPosition?.debtAmount ?? 0n,
                  ],
                }),
                encodeFunctionData({
                  abi: FUTURES_MARKET_ABI,
                  functionName: 'withdraw',
                  args: [
                    userPosition.asset.currency.address,
                    walletClient.account.address,
                    userPosition?.collateralAmount ?? 0n,
                  ],
                }),
              ],
            ],
          },
          5_000_000n,
        )
        const transactionReceipt = await sendTransaction(
          selectedChain,
          walletClient,
          transaction,
          disconnectAsync,
        )
        if (transactionReceipt) {
          queuePendingTransaction({
            ...confirmation,
            txHash: transactionReceipt.transactionHash,
            success: transactionReceipt.status === 'success',
            blockNumber: Number(transactionReceipt.blockNumber),
            type: 'repay-all',
            timestamp: currentTimestampInSeconds(),
            debtCurrency: userPosition.asset.currency,
          } as Transaction)
          if (transactionReceipt.status === 'success') {
            queuePendingPositionCurrency(userPosition.asset.currency)
          }
        }
        return transactionReceipt?.transactionHash
      } catch (e) {
        console.error(e)
      } finally {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['futures-positions'] }),
          queryClient.invalidateQueries({ queryKey: ['balances'] }),
        ])
        setConfirmation(undefined)
      }
    },
    [
      disconnectAsync,
      prices,
      publicClient,
      queryClient,
      queuePendingPositionCurrency,
      queuePendingTransaction,
      selectedChain,
      setConfirmation,
      walletClient,
    ],
  )

  const settle = useCallback(
    async (asset: Asset): Promise<Hash | undefined> => {
      if (!walletClient) {
        return
      }

      try {
        const confirmation = {
          title: `Settle ${asset.currency.symbol}`,
          body: 'Please confirm in your wallet.',
          chain: selectedChain,
          fields: [],
        }
        setConfirmation(confirmation)

        const evmPriceServiceConnection = new EvmPriceServiceConnection(
          PYTH_HERMES_ENDPOINT[selectedChain.id],
        )
        const priceFeedUpdateData =
          await evmPriceServiceConnection.getPriceFeedsUpdateData([
            asset.currency.priceFeedId,
            asset.collateral.priceFeedId,
          ])

        if (priceFeedUpdateData.length === 0) {
          console.error('Price feed not found')
          return
        }

        const fee = await publicClient.readContract({
          address: FUTURES_CONTRACT_ADDRESSES[selectedChain.id]!.PythOracle,
          abi: PYTH_ORACLE_ABI,
          functionName: 'getUpdateFee',
          args: [priceFeedUpdateData as any],
        })

        const transaction = await buildTransaction(
          publicClient,
          {
            chain: selectedChain,
            address:
              FUTURES_CONTRACT_ADDRESSES[selectedChain.id]!.FuturesMarket,
            functionName: 'multicall',
            abi: FUTURES_MARKET_ABI,
            value: fee,
            args: [
              [
                encodeFunctionData({
                  abi: FUTURES_MARKET_ABI,
                  functionName: 'updateOracle',
                  args: [
                    encodeAbiParameters(parseAbiParameters('bytes[]'), [
                      priceFeedUpdateData as any,
                    ]),
                  ],
                }),
                encodeFunctionData({
                  abi: FUTURES_MARKET_ABI,
                  functionName: 'settle',
                  args: [asset.currency.address],
                }),
              ],
            ],
          },
          5_000_000n,
        )
        const transactionReceipt = await sendTransaction(
          selectedChain,
          walletClient,
          transaction,
          disconnectAsync,
        )
        if (transactionReceipt) {
          queuePendingTransaction({
            ...confirmation,
            txHash: transactionReceipt.transactionHash,
            success: transactionReceipt.status === 'success',
            blockNumber: Number(transactionReceipt.blockNumber),
            type: 'settle',
            timestamp: currentTimestampInSeconds(),
          })
        }
        return transactionReceipt?.transactionHash
      } catch (e) {
        console.error(e)
      } finally {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['futures-assets'] }),
        ])
        setConfirmation(undefined)
      }
    },
    [
      disconnectAsync,
      publicClient,
      queryClient,
      queuePendingTransaction,
      selectedChain,
      setConfirmation,
      walletClient,
    ],
  )

  const close = useCallback(
    async (
      asset: Asset,
      collateralReceived: bigint,
    ): Promise<Hash | undefined> => {
      if (!walletClient) {
        return
      }

      try {
        const confirmation = {
          title: `Close`,
          body: 'Please confirm in your wallet.',
          chain: selectedChain,
          fields: [
            {
              currency: asset.collateral,
              label: asset.collateral.symbol,
              direction: 'out',
              value: toPlacesAmountString(
                formatUnits(collateralReceived, asset.collateral.decimals),
                prices[asset.collateral.address] ?? 0,
              ),
            },
          ] as Confirmation['fields'],
        }
        setConfirmation(confirmation)

        const transaction = await buildTransaction(
          publicClient,
          {
            chain: selectedChain,
            address:
              FUTURES_CONTRACT_ADDRESSES[selectedChain.id]!.FuturesMarket,
            functionName: 'close',
            abi: FUTURES_MARKET_ABI,
            args: [asset.currency.address, walletClient.account.address],
          },
          5_000_000n,
        )
        const transactionReceipt = await sendTransaction(
          selectedChain,
          walletClient,
          transaction,
          disconnectAsync,
        )
        if (transactionReceipt) {
          queuePendingTransaction({
            ...confirmation,
            txHash: transactionReceipt.transactionHash,
            success: transactionReceipt.status === 'success',
            blockNumber: Number(transactionReceipt.blockNumber),
            type: 'close',
            timestamp: currentTimestampInSeconds(),
          })
        }
        return transactionReceipt?.transactionHash
      } catch (e) {
        console.error(e)
      } finally {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['futures-positions'] }),
          queryClient.invalidateQueries({ queryKey: ['balances'] }),
        ])
        setConfirmation(undefined)
      }
    },
    [
      disconnectAsync,
      prices,
      publicClient,
      queryClient,
      queuePendingTransaction,
      selectedChain,
      setConfirmation,
      walletClient,
    ],
  )

  const redeem = useCallback(
    async (
      asset: Asset,
      amount: bigint,
      collateralReceived: bigint,
    ): Promise<Hash | undefined> => {
      if (!walletClient) {
        return
      }

      try {
        const confirmation = {
          title: `Redeem`,
          body: 'Please confirm in your wallet.',
          chain: selectedChain,
          fields: [
            {
              currency: asset.currency,
              label: asset.currency.symbol,
              direction: 'in',
              value: toPlacesAmountString(
                formatUnits(amount, asset.currency.decimals),
                prices[asset.currency.address] ?? 0,
              ),
            },
            {
              currency: asset.collateral,
              label: asset.collateral.symbol,
              direction: 'out',
              value: toPlacesAmountString(
                formatUnits(collateralReceived, asset.collateral.decimals),
                prices[asset.collateral.address] ?? 0,
              ),
            },
          ] as Confirmation['fields'],
        }
        setConfirmation(confirmation)

        const transaction = await buildTransaction(
          publicClient,
          {
            chain: selectedChain,
            address:
              FUTURES_CONTRACT_ADDRESSES[selectedChain.id]!.FuturesMarket,
            functionName: 'redeem',
            abi: FUTURES_MARKET_ABI,
            args: [
              asset.currency.address,
              walletClient.account.address,
              amount,
            ],
          },
          1_000_000n,
        )
        const transactionReceipt = await sendTransaction(
          selectedChain,
          walletClient,
          transaction,
          disconnectAsync,
        )
        if (transactionReceipt) {
          queuePendingTransaction({
            ...confirmation,
            txHash: transactionReceipt.transactionHash,
            success: transactionReceipt.status === 'success',
            blockNumber: Number(transactionReceipt.blockNumber),
            type: 'redeem',
            timestamp: currentTimestampInSeconds(),
          })
        }
        return transactionReceipt?.transactionHash
      } catch (e) {
        console.error(e)
      } finally {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['futures-positions'] }),
          queryClient.invalidateQueries({ queryKey: ['balances'] }),
        ])
        setConfirmation(undefined)
      }
    },
    [
      disconnectAsync,
      prices,
      publicClient,
      queryClient,
      queuePendingTransaction,
      selectedChain,
      setConfirmation,
      walletClient,
    ],
  )

  const addCollateral = useCallback(
    async (asset: Asset, amount: bigint): Promise<Hash | undefined> => {
      if (!walletClient) {
        return
      }

      try {
        const confirmation = {
          title: `Add Collateral`,
          body: 'Please confirm in your wallet.',
          chain: selectedChain,
          fields: [
            {
              currency: asset.collateral,
              label: asset.collateral.symbol,
              direction: 'in',
              value: toPlacesAmountString(
                formatUnits(amount, asset.collateral.decimals),
                prices[asset.collateral.address] ?? 0,
              ),
            },
          ] as Confirmation['fields'],
        }
        setConfirmation(confirmation)

        const transaction = await buildTransaction(
          publicClient,
          {
            chain: selectedChain,
            address:
              FUTURES_CONTRACT_ADDRESSES[selectedChain.id]!.FuturesMarket,
            functionName: 'deposit',
            abi: FUTURES_MARKET_ABI,
            args: [
              asset.currency.address,
              walletClient.account.address,
              amount,
            ],
          },
          1_000_000n,
        )
        const transactionReceipt = await sendTransaction(
          selectedChain,
          walletClient,
          transaction,
          disconnectAsync,
        )
        if (transactionReceipt) {
          queuePendingTransaction({
            ...confirmation,
            txHash: transactionReceipt.transactionHash,
            success: transactionReceipt.status === 'success',
            blockNumber: Number(transactionReceipt.blockNumber),
            type: 'add-collateral',
            timestamp: currentTimestampInSeconds(),
            debtCurrency: asset.currency,
          } as Transaction)
          if (transactionReceipt.status === 'success') {
            queuePendingPositionCurrency(asset.currency)
          }
        }
        return transactionReceipt?.transactionHash
      } catch (e) {
        console.error(e)
      } finally {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['futures-positions'] }),
          queryClient.invalidateQueries({ queryKey: ['balances'] }),
        ])
        setConfirmation(undefined)
      }
    },
    [
      disconnectAsync,
      prices,
      publicClient,
      queryClient,
      queuePendingPositionCurrency,
      queuePendingTransaction,
      selectedChain,
      setConfirmation,
      walletClient,
    ],
  )

  const removeCollateral = useCallback(
    async (asset: Asset, amount: bigint): Promise<Hash | undefined> => {
      if (!walletClient) {
        return
      }

      try {
        const confirmation = {
          title: `Remove Collateral`,
          body: 'Please confirm in your wallet.',
          chain: selectedChain,
          fields: [
            {
              currency: asset.collateral,
              label: asset.collateral.symbol,
              direction: 'out',
              value: toPlacesAmountString(
                formatUnits(amount, asset.collateral.decimals),
                prices[asset.collateral.address] ?? 0,
              ),
            },
          ] as Confirmation['fields'],
        }
        setConfirmation(confirmation)

        const evmPriceServiceConnection = new EvmPriceServiceConnection(
          PYTH_HERMES_ENDPOINT[selectedChain.id],
        )
        const priceFeedUpdateData =
          await evmPriceServiceConnection.getPriceFeedsUpdateData([
            asset.currency.priceFeedId,
            asset.collateral.priceFeedId,
          ])

        if (priceFeedUpdateData.length === 0) {
          console.error('Price feed not found')
          return
        }

        const fee = await publicClient.readContract({
          address: FUTURES_CONTRACT_ADDRESSES[selectedChain.id]!.PythOracle,
          abi: PYTH_ORACLE_ABI,
          functionName: 'getUpdateFee',
          args: [priceFeedUpdateData as any],
        })

        const transaction = await buildTransaction(
          publicClient,
          {
            chain: selectedChain,
            address:
              FUTURES_CONTRACT_ADDRESSES[selectedChain.id]!.FuturesMarket,
            functionName: 'multicall',
            abi: FUTURES_MARKET_ABI,
            value: fee,
            args: [
              [
                encodeFunctionData({
                  abi: FUTURES_MARKET_ABI,
                  functionName: 'updateOracle',
                  args: [
                    encodeAbiParameters(parseAbiParameters('bytes[]'), [
                      priceFeedUpdateData as any,
                    ]),
                  ],
                }),
                encodeFunctionData({
                  abi: FUTURES_MARKET_ABI,
                  functionName: 'withdraw',
                  args: [
                    asset.currency.address,
                    walletClient.account.address,
                    amount,
                  ],
                }),
              ],
            ],
          },
          5_000_000n,
        )
        const transactionReceipt = await sendTransaction(
          selectedChain,
          walletClient,
          transaction,
          disconnectAsync,
        )
        if (transactionReceipt) {
          queuePendingTransaction({
            ...confirmation,
            txHash: transactionReceipt.transactionHash,
            success: transactionReceipt.status === 'success',
            blockNumber: Number(transactionReceipt.blockNumber),
            type: 'remove-collateral',
            timestamp: currentTimestampInSeconds(),
            debtCurrency: asset.currency,
          } as Transaction)
          if (transactionReceipt.status === 'success') {
            queuePendingPositionCurrency(asset.currency)
          }
        }
        return transactionReceipt?.transactionHash
      } catch (e) {
        console.error(e)
      } finally {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['futures-positions'] }),
          queryClient.invalidateQueries({ queryKey: ['balances'] }),
        ])
        setConfirmation(undefined)
      }
    },
    [
      disconnectAsync,
      prices,
      publicClient,
      queryClient,
      queuePendingPositionCurrency,
      queuePendingTransaction,
      selectedChain,
      setConfirmation,
      walletClient,
    ],
  )

  return (
    <Context.Provider
      value={{
        isMarketClose,
        borrow,
        repay,
        repayAll,
        settle,
        close,
        redeem,
        addCollateral,
        removeCollateral,
        pendingPositionCurrencies,
      }}
    >
      {children}
    </Context.Provider>
  )
}

export const useFuturesContractContext = () =>
  React.useContext(Context) as FuturesContractContext
