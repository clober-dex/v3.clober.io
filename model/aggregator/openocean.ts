import { formatUnits, getAddress, isAddressEqual, zeroAddress } from 'viem'
import { v4 as uuidv4 } from 'uuid'

import { Chain } from '../chain'
import { Currency } from '../currency'
import { fetchApi } from '../../apis/utils'
import { Prices } from '../prices'
import { PathViz } from '../pathviz'

import { Aggregator } from './index'

export class OpenOceanAggregator implements Aggregator {
  public readonly name = 'OpenOcean'
  public readonly baseUrl = 'https://open-api.openocean.finance'
  public readonly contract: `0x${string}`
  public readonly chain: Chain
  private readonly TIMEOUT = 4000
  private readonly nativeTokenAddress = zeroAddress

  private latestQuoteId: string | undefined
  private transactionCache: {
    [quoteId: string]: {
      data: `0x${string}`
      gas: bigint
      value: bigint
      to: `0x${string}`
      nonce?: number
      gasPrice?: bigint
    }
  } = {}

  constructor(contract: `0x${string}`, chain: Chain) {
    this.contract = contract
    this.chain = chain
  }

  public async currencies(): Promise<Currency[]> {
    return [] as Currency[]
  }

  public async prices(): Promise<Prices> {
    return {} as Prices
  }

  public async quote(
    inputCurrency: Currency,
    amountIn: bigint,
    outputCurrency: Currency,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    slippageLimitPercent: number,
    gasPrice: bigint,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    userAddress?: `0x${string}`,
  ): Promise<{
    amountOut: bigint
    gasLimit: bigint
    pathViz: PathViz | undefined
    aggregator: Aggregator
    priceImpact: number
  }> {
    if (userAddress) {
      this.latestQuoteId = undefined
    }
    const response = await fetchApi<{
      code: number
      data: {
        outAmount: string
        estimatedGas: string
        price_impact: string
      }
    }>(this.baseUrl, `v4/${this.chain.id}/quote`, {
      method: 'GET',
      headers: {
        accept: 'application/json',
      },
      timeout: this.TIMEOUT,
      params: {
        inTokenAddress: isAddressEqual(
          inputCurrency.address,
          this.nativeTokenAddress,
        )
          ? this.nativeTokenAddress
          : getAddress(inputCurrency.address),
        outTokenAddress: isAddressEqual(
          outputCurrency.address,
          this.nativeTokenAddress,
        )
          ? this.nativeTokenAddress
          : getAddress(outputCurrency.address),
        amount: formatUnits(amountIn, inputCurrency.decimals),
        gasPrice: formatUnits(gasPrice, 9),
      },
    })

    if (response.code !== 200) {
      throw new Error(`Quote failed: ${response.code}`)
    }

    if (userAddress) {
      this.latestQuoteId = uuidv4()
      this.transactionCache[this.latestQuoteId] = await this.buildCallData(
        inputCurrency,
        amountIn,
        outputCurrency,
        slippageLimitPercent,
        gasPrice,
        userAddress,
      )
    }

    return {
      amountOut: BigInt(response.data.outAmount),
      gasLimit: BigInt(response.data.estimatedGas),
      pathViz: undefined,
      aggregator: this,
      priceImpact: Number(response.data.price_impact.replace('%', '')) / 100,
    }
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
    if (!this.latestQuoteId) {
      await this.quote(
        inputCurrency,
        amountIn,
        outputCurrency,
        slippageLimitPercent,
        gasPrice,
        userAddress,
      )
    }

    if (!this.latestQuoteId) {
      throw new Error('Quote ID is not defined')
    }

    if (this.transactionCache[this.latestQuoteId]) {
      return this.transactionCache[this.latestQuoteId]
    }

    const response = await fetchApi<{
      code: number
      data: {
        data: `0x${string}`
        estimatedGas: string
        value: string
        to: `0x${string}`
      }
    }>(this.baseUrl, `v4/${this.chain.id}/swap`, {
      method: 'GET',
      timeout: this.TIMEOUT,
      headers: {
        accept: 'application/json',
      },
      params: {
        inTokenAddress: isAddressEqual(
          inputCurrency.address,
          this.nativeTokenAddress,
        )
          ? this.nativeTokenAddress
          : getAddress(inputCurrency.address),
        outTokenAddress: isAddressEqual(
          outputCurrency.address,
          this.nativeTokenAddress,
        )
          ? this.nativeTokenAddress
          : getAddress(outputCurrency.address),
        amount: formatUnits(amountIn, inputCurrency.decimals),
        gasPrice: formatUnits(gasPrice, 9),
        slippage: slippageLimitPercent.toString(),
        account: userAddress,
        referrer: '0x331fa4a4f7b906491f37bdc8b042b894234e101f' as `0x${string}`,
      },
    })

    if (response.code !== 200) {
      throw new Error(`Swap quote failed: ${response.code}`)
    }

    return {
      data: response.data.data,
      gas: BigInt(response.data.estimatedGas),
      value: BigInt(response.data.value),
      to: response.data.to,
      gasPrice: gasPrice,
    }
  }
}
