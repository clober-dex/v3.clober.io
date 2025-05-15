import { getAddress } from 'viem'
import { Transaction } from '@clober/v2-sdk'

import { Currency } from '../currency'
import { fetchApi } from '../../apis/utils'
import { Prices } from '../prices'
import { Chain } from '../chain'

import { Aggregator } from './index'

export class OdosAggregator implements Aggregator {
  public readonly name = 'Odos'
  public readonly baseUrl = 'https://api.odos.xyz'
  public readonly contract: `0x${string}`
  public readonly chain: Chain
  private readonly TIMEOUT = 4000

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
    aggregator: Aggregator
    transaction: Transaction | undefined
  }> {
    const result: {
      outAmounts: string[]
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

    if (userAddress) {
      const transaction = await this.buildCallData(result.pathId, userAddress)
      return {
        amountOut: BigInt(result.outAmounts[0]),
        gasLimit: BigInt(result.gasEstimate),
        aggregator: this,
        transaction,
      }
    }

    return {
      amountOut: BigInt(result.outAmounts[0]),
      gasLimit: BigInt(result.gasEstimate),
      aggregator: this,
      transaction: undefined,
    }
  }

  private async buildCallData(
    pathId: string,
    userAddress: `0x${string}`,
  ): Promise<Transaction> {
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
      timeout: this.TIMEOUT,
      data: {
        pathId,
        simulate: true,
        userAddr: userAddress,
      },
    })
    const gas = BigInt(result.transaction.gas)
    if (gas === -1n) {
      throw new Error('Gas estimate failed')
    }
    return {
      data: result.transaction.data,
      gas,
      value: BigInt(result.transaction.value),
      to: result.transaction.to,
      gasPrice: BigInt(result.transaction.gasPrice),
      from: userAddress,
    }
  }
}
