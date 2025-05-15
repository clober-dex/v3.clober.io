import {
  encodeFunctionData,
  getAddress,
  isAddressEqual,
  parseUnits,
  zeroAddress,
} from 'viem'
import {
  getExpectedOutput,
  getSubgraphEndpoint,
  marketOrder,
  Transaction,
} from '@clober/v2-sdk'
import { monadTestnet } from 'viem/chains'

import { Currency } from '../currency'
import { Prices } from '../prices'
import { RPC_URL } from '../../constants/rpc-url'
import { formatUnits } from '../../utils/bigint'
import { WETH } from '../../constants/currency'
import { WETH_ABI } from '../../abis/weth-abi'
import { Chain } from '../chain'
import { Subgraph } from '../subgraph'

import { Aggregator } from './index'

export class CloberV2Aggregator implements Aggregator {
  public readonly name = 'CloberV2'
  public readonly baseUrl = ''
  public readonly contract: `0x${string}`
  private readonly nativeTokenAddress = zeroAddress
  public readonly chain: Chain
  public readonly weth: `0x${string}`
  private defaultGasLimit = 700_000n

  constructor(contract: `0x${string}`, chain: Chain) {
    this.contract = contract
    this.chain = chain
    this.weth = WETH[chain.id].address
  }

  public async currencies(): Promise<Currency[]> {
    return [] as Currency[]
  }

  public async prices(): Promise<Prices> {
    if (this.chain.id === monadTestnet.id) {
      const {
        data: {
          monChartLogs,
          muBondChartLogs,
          aprMonChartLogs,
          gMonChartLogs,
          sMonChartLogs,
          shMonChartLogs,
        },
      } = await Subgraph.get<{
        data: {
          monChartLogs: { id: string; close: string }[]
          muBondChartLogs: { id: string; close: string }[]
          aprMonChartLogs: { id: string; close: string }[]
          gMonChartLogs: { id: string; close: string }[]
          sMonChartLogs: { id: string; close: string }[]
          shMonChartLogs: { id: string; close: string }[]
        }
      }>(
        getSubgraphEndpoint({ chainId: this.chain.id }),
        '',
        '{ monChartLogs: chartLogs( first: 1 orderBy: timestamp orderDirection: desc where: {marketCode: "0x0000000000000000000000000000000000000000/0xf817257fed379853cde0fa4f97ab987181b1e5ea"} ) { id close } muBondChartLogs: chartLogs( first: 1 orderBy: timestamp orderDirection: desc where: {marketCode: "0x0efed4d9fb7863ccc7bb392847c08dcd00fe9be2/0xf817257fed379853cde0fa4f97ab987181b1e5ea"} ) { id close } aprMonChartLogs: chartLogs( first: 1 orderBy: timestamp orderDirection: desc where: {marketCode: "0xb2f82d0f38dc453d596ad40a37799446cc89274a/0x0000000000000000000000000000000000000000"} ) { id close } gMonChartLogs: chartLogs( first: 1 orderBy: timestamp orderDirection: desc where: {marketCode: "0xaeef2f6b429cb59c9b2d7bb2141ada993e8571c3/0x0000000000000000000000000000000000000000"} ) { id close } sMonChartLogs: chartLogs( first: 1 orderBy: timestamp orderDirection: desc where: {marketCode: "0xe1d2439b75fb9746e7bc6cb777ae10aa7f7ef9c5/0x0000000000000000000000000000000000000000"} ) { id close } shMonChartLogs: chartLogs( first: 1 orderBy: timestamp orderDirection: desc where: {marketCode: "0x3a98250f98dd388c211206983453837c8365bdc1/0x0000000000000000000000000000000000000000"} ) { id close } }',
        {},
      )
      const monPrice = Number(monChartLogs?.[0]?.close ?? 0)
      const muBondPrice = Number(muBondChartLogs?.[0]?.close ?? 0)
      const aprMonPrice = Number(aprMonChartLogs?.[0]?.close ?? 0)
      const gMonPrice = Number(gMonChartLogs?.[0]?.close ?? 0)
      const sMonPrice = Number(sMonChartLogs?.[0]?.close ?? 0)
      const shMonPrice = Number(shMonChartLogs?.[0]?.close ?? 0)
      return {
        [zeroAddress]: monPrice,
        [getAddress('0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701')]: monPrice,
        [getAddress('0x0EfeD4D9fB7863ccC7bb392847C08dCd00FE9bE2')]: muBondPrice,
        [getAddress('0xb2f82D0f38dc453D596Ad40A37799446Cc89274A')]:
          monPrice * aprMonPrice,
        [getAddress('0xaEef2f6B429Cb59C9B2D7bB2141ADa993E8571c3')]:
          monPrice * gMonPrice,
        [getAddress('0xe1D2439B75FB9746e7Bc6cb777AE10AA7F7EF9C5')]:
          monPrice * sMonPrice,
        [getAddress('0x3A98250F98dd388C211206983453837C8365bdC1')]:
          monPrice * shMonPrice,
      }
    }
    return {} as Prices
  }

  public async quote(
    inputCurrency: Currency,
    amountIn: bigint,
    outputCurrency: Currency,
    slippageLimitPercent: number,
    gasPrice: bigint,
    userAddress?: `0x${string}`,
  ): Promise<{
    amountOut: bigint
    gasLimit: bigint
    aggregator: Aggregator
    transaction: Transaction | undefined
  }> {
    if (
      (isAddressEqual(inputCurrency.address, this.nativeTokenAddress) &&
        isAddressEqual(outputCurrency.address, this.weth)) ||
      (isAddressEqual(inputCurrency.address, this.weth) &&
        isAddressEqual(outputCurrency.address, this.nativeTokenAddress))
    ) {
      if (userAddress) {
        const { transaction, amountOut } = await this.buildCallData(
          inputCurrency,
          amountIn,
          outputCurrency,
          slippageLimitPercent,
          gasPrice,
          userAddress,
        )
        return {
          amountOut,
          gasLimit: this.defaultGasLimit,
          aggregator: this,
          transaction,
        }
      }
      return {
        amountOut: amountIn,
        gasLimit: this.defaultGasLimit,
        aggregator: this,
        transaction: undefined,
      }
    }

    try {
      if (userAddress) {
        const { transaction, amountOut } = await this.buildCallData(
          inputCurrency,
          amountIn,
          outputCurrency,
          slippageLimitPercent,
          gasPrice,
          userAddress,
        )
        return {
          amountOut,
          gasLimit: this.defaultGasLimit,
          aggregator: this,
          transaction,
        }
      } else {
        const { takenAmount } = await getExpectedOutput({
          chainId: this.chain.id,
          inputToken: inputCurrency.address,
          outputToken: outputCurrency.address,
          amountIn: formatUnits(amountIn, inputCurrency.decimals),
          options: {
            rpcUrl: RPC_URL[this.chain.id],
            useSubgraph: false,
          },
        })
        return {
          amountOut: parseUnits(takenAmount, outputCurrency.decimals),
          gasLimit: this.defaultGasLimit,
          aggregator: this,
          transaction: undefined,
        }
      }
    } catch {
      return {
        amountOut: 0n,
        gasLimit: this.defaultGasLimit,
        aggregator: this,
        transaction: undefined,
      }
    }
  }

  private async buildCallData(
    inputCurrency: Currency,
    amountIn: bigint,
    outputCurrency: Currency,
    slippageLimitPercent: number,
    gasPrice: bigint,
    userAddress: `0x${string}`,
  ): Promise<{
    transaction: Transaction
    amountOut: bigint
  }> {
    if (
      isAddressEqual(inputCurrency.address, this.nativeTokenAddress) &&
      isAddressEqual(outputCurrency.address, this.weth)
    ) {
      return {
        transaction: {
          data: encodeFunctionData({
            abi: WETH_ABI,
            functionName: 'deposit',
          }),
          gas: this.defaultGasLimit,
          value: amountIn,
          to: WETH[this.chain.id].address,
          gasPrice,
          from: userAddress,
        },
        amountOut: amountIn,
      }
    } else if (
      isAddressEqual(inputCurrency.address, this.weth) &&
      isAddressEqual(outputCurrency.address, this.nativeTokenAddress)
    ) {
      return {
        transaction: {
          data: encodeFunctionData({
            abi: WETH_ABI,
            functionName: 'withdraw',
            args: [amountIn],
          }),
          gas: this.defaultGasLimit,
          value: 0n,
          to: WETH[this.chain.id].address,
          gasPrice,
          from: userAddress,
        },
        amountOut: amountIn,
      }
    }

    const {
      transaction,
      result: {
        taken: {
          amount,
          currency: { decimals },
        },
      },
    } = await marketOrder({
      chainId: this.chain.id,
      userAddress,
      inputToken: inputCurrency.address,
      outputToken: outputCurrency.address,
      amountIn: formatUnits(amountIn, inputCurrency.decimals),
      options: {
        rpcUrl: RPC_URL[this.chain.id],
        useSubgraph: false,
        slippage: slippageLimitPercent,
        gasLimit: this.defaultGasLimit,
      },
    })
    return { transaction, amountOut: parseUnits(amount, decimals) }
  }
}
