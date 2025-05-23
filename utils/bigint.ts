import BigNumber from 'bignumber.js'
import { formatUnits as _formatUnits } from 'viem'

import { findFirstNonZeroIndex } from './bignumber'
import { POLLY_FILL_DECIMALS, toCommaSeparated } from './number'

export const max = (...args: bigint[]) =>
  args.reduce((m, e) => (e > m ? e : m), 0n)
export const min = (...args: bigint[]) =>
  args.reduce((m, e) => (e < m ? e : m), 2n ** 256n - 1n)

export const dollarValue = (
  value: bigint,
  decimals: number,
  price?: number,
): BigNumber => {
  if (!price) {
    return new BigNumber(0)
  }
  return new BigNumber(value.toString()).times(price).div(10 ** decimals)
}
export const formatDollarValue = (
  value: bigint,
  decimals: number,
  price?: number,
): string => {
  return `$${toCommaSeparated(dollarValue(value, decimals, price).toFixed(2))}`
}
export const formatUnits = (
  value: bigint,
  decimals: number,
  price?: number,
): string => {
  const formatted = _formatUnits(value, decimals)
  if (!price) {
    const index = findFirstNonZeroIndex(formatted) + POLLY_FILL_DECIMALS
    return new BigNumber(formatted).toFixed(index, BigNumber.ROUND_FLOOR)
  }
  const underHalfPennyDecimals =
    Math.floor(Math.max(-Math.log10(0.005 / price), 0) / 2) * 2
  const fixed = new BigNumber(formatted).toFixed(underHalfPennyDecimals)
  return +fixed === 0 ? formatted : fixed
}

export const applyPercent = (
  amount: bigint,
  percent: number,
  decimal: number = 5,
): bigint => {
  return (
    (amount * BigInt(Math.floor(percent * 10 ** decimal))) /
    BigInt(100 * 10 ** decimal)
  )
}
