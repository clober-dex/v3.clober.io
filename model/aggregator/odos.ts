import { getAddress } from 'viem'

import { Currency } from '../currency'
import { fetchApi } from '../../apis/utils'
import { Prices } from '../prices'
import { PathViz } from '../pathviz'
import { Chain } from '../chain'

import { Aggregator } from './index'

export class OdosAggregator implements Aggregator {
  public readonly name = 'Odos'
  public readonly baseUrl = 'https://api.odos.xyz'
  public readonly contract: `0x${string}`
  public readonly chain: Chain
  private readonly TIMEOUT = 4000

  private latestState:
    | {
        pathId: string
        amountIn: bigint
      }
    | undefined = undefined

  constructor(contract: `0x${string}`, chain: Chain) {
    this.contract = contract
    this.chain = chain
  }

  public async currencies(): Promise<Currency[]> {
    return Object.entries(
      (
        await fetchApi<{
          tokenMap: Currency[]
        }>(this.baseUrl, `info/tokens/${this.chain.id}`)
      ).tokenMap,
    ).map(([address, currency]) => ({
      address: getAddress(address),
      name: currency.name,
      symbol: currency.symbol,
      decimals: currency.decimals,
    }))
  }

  public async prices(): Promise<Prices> {
    return Object.entries(
      (
        await fetchApi<{
          tokenPrices: Prices
        }>(this.baseUrl, `pricing/token/${this.chain.id}`)
      ).tokenPrices,
    ).reduce((acc, [address, price]) => {
      acc[getAddress(address)] = price
      return acc
    }, {} as Prices)
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
    pathViz: PathViz | undefined
    aggregator: Aggregator
    priceImpact: number
  }> {
    this.latestState = undefined
    console.log(
      'Fetching quote...',
      inputCurrency.symbol,
      outputCurrency.symbol,
      amountIn,
    )
    const result: {
      outAmounts: string[]
      pathViz: PathViz
      pathId: string
      gasEstimate: number
      priceImpact: number
    } = await fetchApi(this.baseUrl, 'sor/quote/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      timeout: this.TIMEOUT,
      data: {
        chainId: this.chain.id,
        inputTokens: [
          {
            tokenAddress: getAddress(inputCurrency.address),
            amount: amountIn.toString(),
          },
        ],
        outputTokens: [
          {
            tokenAddress: getAddress(outputCurrency.address),
            proportion: 1,
          },
        ],
        gasPrice: Number(gasPrice) / 1000000000,
        userAddr: userAddress,
        slippageLimitPercent,
        sourceBlacklist: [],
        pathViz: true,
        referralCode: '1939997089',
      },
    })
    this.latestState = { pathId: result.pathId, amountIn }
    return {
      amountOut: BigInt(result.outAmounts[0]),
      gasLimit: BigInt(result.gasEstimate),
      pathViz: result.pathViz,
      aggregator: this,
      priceImpact: Number(result.priceImpact),
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
    if (
      !this.latestState ||
      (this.latestState && (this.latestState?.amountIn ?? 0n) !== amountIn)
    ) {
      console.log('Path ID is not defined, fetching...')
      const { pathId } = await fetchApi<{
        pathId: string
      }>(this.baseUrl, 'sor/quote/v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json',
        },
        timeout: this.TIMEOUT,
        data: {
          chainId: this.chain.id,
          inputTokens: [
            {
              tokenAddress: getAddress(inputCurrency.address),
              amount: amountIn.toString(),
            },
          ],
          outputTokens: [
            {
              tokenAddress: getAddress(outputCurrency.address),
              proportion: 1,
            },
          ],
          gasPrice: Number(gasPrice) / 1000000000,
          userAddr: userAddress,
          slippageLimitPercent,
          sourceBlacklist: [],
          pathViz: true,
          referralCode: '1939997089',
        },
      })
      this.latestState = { pathId, amountIn }
    }
    if (!this.latestState) {
      throw new Error('Path ID is not defined')
    }
    console.log('Assembling transaction...', this.latestState)
    const result = await fetchApi<{
      transaction: {
        data: `0x${string}`
        gas: number
        value: string
        to: `0x${string}`
        nonce: number
        gasPrice: bigint
      }
    }>(this.baseUrl, 'sor/assemble', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      data: {
        pathId: this.latestState.pathId,
        simulate: true,
        userAddr: userAddress,
      },
    })
    const gas = BigInt(result.transaction.gas)
    return {
      data: result.transaction.data,
      gas: gas === -1n ? 1_000_000n : gas,
      value: BigInt(result.transaction.value),
      to: result.transaction.to,
      nonce: result.transaction.nonce,
      gasPrice: BigInt(result.transaction.gasPrice),
    }
  }
}
