import { encodeFunctionData, isAddressEqual, zeroAddress } from 'viem'

import { Chain } from '../chain'
import { Currency } from '../currency'
import { Prices } from '../prices'
import { PathViz } from '../pathviz'

import { Aggregator } from './index'

export class AggregatorRouterGateway implements Aggregator {
  public readonly name: string
  public readonly baseUrl: string = ''
  public readonly contract: `0x${string}`
  public readonly chain: Chain
  private readonly aggregator: Aggregator

  constructor(contract: `0x${string}`, chain: Chain, aggregator: Aggregator) {
    this.contract = contract
    this.chain = chain
    this.aggregator = aggregator
    this.name = aggregator.name
  }

  public async currencies(): Promise<Currency[]> {
    return this.aggregator.currencies()
  }

  public async prices(): Promise<Prices> {
    return this.aggregator.prices()
  }

  quote(
    inputCurrency: Currency,
    amountIn: bigint,
    outputCurrency: Currency,
    ...args: any[]
  ): Promise<{
    amountOut: bigint
    gasLimit: bigint
    pathViz: PathViz | undefined
    aggregator: Aggregator
    priceImpact?: number
  }> {
    return this.aggregator.quote(
      inputCurrency,
      amountIn,
      outputCurrency,
      ...args,
    )
  }

  public async buildCallData(
    inputCurrency: Currency,
    amountIn: bigint,
    outputCurrency: Currency,
    slippageLimitPercent: number,
    gasPrice: bigint,
    userAddress: `0x${string}`,
  ): Promise<{
    data: `0x${string}`
    gas: bigint
    value: bigint
    to: `0x${string}`
    nonce?: number
    gasPrice?: bigint
  }> {
    const {
      data: swapData,
      gas,
      gasPrice: _gasPrice,
    } = await this.aggregator.buildCallData(
      inputCurrency,
      amountIn,
      outputCurrency,
      slippageLimitPercent,
      gasPrice,
      userAddress,
    )
    const data = encodeFunctionData({
      abi: [
        {
          inputs: [
            { internalType: 'address', name: 'inToken', type: 'address' },
            { internalType: 'address', name: 'outToken', type: 'address' },
            { internalType: 'uint256', name: 'amountIn', type: 'uint256' },
            { internalType: 'address', name: 'router', type: 'address' },
            { internalType: 'bytes', name: 'data', type: 'bytes' },
          ],
          name: 'swap',
          outputs: [
            { internalType: 'uint256', name: 'amountOut', type: 'uint256' },
          ],
          stateMutability: 'payable',
          type: 'function',
        },
      ] as const,
      functionName: 'swap',
      args: [
        inputCurrency.address,
        outputCurrency.address,
        amountIn,
        this.aggregator.contract,
        swapData,
      ],
    })
    return {
      data,
      gas: gas + 300_000n,
      value: isAddressEqual(inputCurrency.address, zeroAddress) ? amountIn : 0n,
      to: this.contract,
      gasPrice: _gasPrice,
    }
  }
}
