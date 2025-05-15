import { Prices } from '../model/prices'
import { Vault } from '../model/vault'
import { Chain } from '../model/chain'

export async function fetchVaults(
  chain: Chain,
  prices: Prices,
): Promise<Vault[]> {
  // return Promise.all(
  //   WHITELISTED_VAULTS[chain.id].map((vaultImmutableInfo) =>
  //     fetchOffChainVault(chain, prices, vaultImmutableInfo),
  //   ),
  // )
  return []
}

// export async function fetchOffChainVault(
//   chain: Chain,
//   prices: Prices,
//   vaultImmutableInfo: VaultImmutableInfo,
// ): Promise<Vault> {
//   const currentTimestampInSeconds = Math.floor(new Date().getTime() / 1000)
//   const _5minNormalizedCurrentTimestampInSeconds =
//     currentTimestampInSeconds - (currentTimestampInSeconds % (60 * 5))
//   const _1minNormalizedCurrentTimestampInSeconds =
//     currentTimestampInSeconds - (currentTimestampInSeconds % 60)
//
//   const vaultPerformanceData = await getPoolPerformance({
//     chainId: chain.id,
//     currencyA: vaultImmutableInfo.currencyA,
//     currencyB: vaultImmutableInfo.currencyB,
//     poolKey: vaultImmutableInfo.key,
//     // volume
//     volumeFromTimestamp:
//       _5minNormalizedCurrentTimestampInSeconds - 60 * 60 * 24,
//     volumeToTimestamp: _5minNormalizedCurrentTimestampInSeconds,
//     // performance chart
//     snapshotFromTimestamp: _1minNormalizedCurrentTimestampInSeconds - 24 * 90,
//     snapshotToTimestamp: _1minNormalizedCurrentTimestampInSeconds,
//     snapshotIntervalType: CHART_LOG_INTERVALS.oneMinute,
//     // apy
//     spreadProfitFromTimestamp:
//       _5minNormalizedCurrentTimestampInSeconds - 60 * 60 * 24,
//     spreadProfitToTimestamp: _5minNormalizedCurrentTimestampInSeconds,
//   })
//   const initialLPInfo = vaultImmutableInfo.initialLPInfo ?? {
//     quoteTokenAmount: 1,
//     baseTokenAmount: 1,
//     lpTokenAmount: 1,
//     timestamp: Math.floor(Date.now() / 1000),
//     initialPriceMultiplier: 1e10,
//   }
//   const [baseCurrency, quoteCurrency] = isAddressEqual(
//     getQuoteToken({
//       chainId: chain.id,
//       token0: vaultImmutableInfo.currencyA.address,
//       token1: vaultImmutableInfo.currencyB.address,
//     }),
//     vaultImmutableInfo.currencyA.address,
//   )
//     ? [vaultImmutableInfo.currencyB, vaultImmutableInfo.currencyA]
//     : [vaultImmutableInfo.currencyA, vaultImmutableInfo.currencyB]
//
//   const historicalLpPrices = vaultPerformanceData.poolSnapshots
//     .map(({ price, liquidityA, liquidityB, totalSupply, timestamp }) => {
//       const quotePrice = prices[quoteCurrency.address] ?? 1
//       const basePrice =
//         Number(price) * quotePrice * initialLPInfo.initialPriceMultiplier
//       const onHoldUSDValuePerLp =
//         (initialLPInfo.quoteTokenAmount * quotePrice +
//           initialLPInfo.baseTokenAmount * basePrice) /
//         initialLPInfo.lpTokenAmount
//       const tvl = isAddressEqual(
//         baseCurrency.address,
//         liquidityA.currency.address,
//       )
//         ? Number(liquidityA.value) * basePrice +
//           Number(liquidityB.value) * quotePrice
//         : Number(liquidityB.value) * basePrice +
//           Number(liquidityA.value) * quotePrice
//       const lpPrice =
//         Number(totalSupply.value) === 0 ? 0 : tvl / Number(totalSupply.value)
//       return {
//         tvl,
//         reserve0: Number(liquidityA.value),
//         reserve1: Number(liquidityB.value),
//         totalSupply: Number(totalSupply.value),
//         lpPrice,
//         time: Number(timestamp),
//         pnl: lpPrice / onHoldUSDValuePerLp,
//       }
//     })
//     .sort((a, b) => a.time - b.time)
//   const firstNonZeroIndex = historicalLpPrices.findIndex(
//     ({ lpPrice }) => lpPrice > 0,
//   )
//   const initialLpPrice =
//     firstNonZeroIndex === -1 ? 1 : historicalLpPrices[firstNonZeroIndex].lpPrice
//   const historicalPriceIndex = historicalLpPrices.map(
//     ({ pnl, lpPrice, time }) => {
//       return {
//         values: [lpPrice !== 0 ? lpPrice / initialLpPrice : 0, pnl, lpPrice, 0],
//         time,
//       }
//     },
//   )
//   const tvl = historicalLpPrices.sort((a, b) => b.time - a.time)[0].tvl
//   const reserve0 = historicalLpPrices.sort((a, b) => b.time - a.time)[0]
//     .reserve0
//   const reserve1 = historicalLpPrices.sort((a, b) => b.time - a.time)[0]
//     .reserve1
//   const totalSupply = historicalLpPrices.sort((a, b) => b.time - a.time)[0]
//     .totalSupply
//   const firstHistoricalPriceIndex = [
//     ...historicalPriceIndex.slice(firstNonZeroIndex),
//   ].sort((a, b) => a.time - b.time)[0]
//   const lastHistoricalPriceIndex = [
//     ...historicalPriceIndex.slice(firstNonZeroIndex),
//   ].sort((a, b) => b.time - a.time)[0]
//   return {
//     key: vaultImmutableInfo.key,
//     salt: vaultImmutableInfo.salt,
//     hasDashboard: vaultImmutableInfo.hasDashboard,
//     hasPoint: vaultImmutableInfo.hasPoint,
//     lpCurrency: {
//       address: getContractAddresses({ chainId: chain.id }).Rebalancer,
//       name: `Clober LP ${vaultImmutableInfo.currencyA.symbol}/${vaultImmutableInfo.currencyB.symbol}`,
//       symbol: `${vaultImmutableInfo.currencyA.symbol}/${vaultImmutableInfo.currencyB.symbol}`,
//       decimals: 18,
//     },
//     lpUsdValue: tvl / totalSupply,
//     currencyA: vaultImmutableInfo.currencyA,
//     currencyB: vaultImmutableInfo.currencyB,
//     reserveA: reserve0,
//     reserveB: reserve1,
//     tvl,
//     apy: vaultImmutableInfo.initialLPInfo
//       ? calculateApy(
//           historicalLpPrices.sort((a, b) => b.time - a.time)[0].pnl,
//           currentTimestampInSeconds - initialLPInfo.timestamp,
//         )
//       : Math.max(
//           calculateApy(
//             lastHistoricalPriceIndex.values[2] /
//               firstHistoricalPriceIndex.values[2],
//             lastHistoricalPriceIndex.time - firstHistoricalPriceIndex.time,
//           ),
//           0,
//         ),
//     volume24h: vaultPerformanceData.poolVolumes.reduce(
//       (acc, { currencyAVolume, currencyBVolume }) =>
//         acc +
//         (isAddressEqual(currencyAVolume.currency.address, quoteCurrency.address)
//           ? Number(currencyAVolume.value) *
//             (prices[vaultImmutableInfo.currencyA.address] ?? 0)
//           : Number(currencyBVolume.value) *
//             (prices[vaultImmutableInfo.currencyB.address] ?? 0)),
//       0,
//     ),
//     totalSupply,
//     historicalPriceIndex: historicalPriceIndex.slice(
//       firstNonZeroIndex,
//     ) as StackedLineData[],
//   }
// }
//
// export async function fetchOnChainVault(
//   chain: Chain,
//   prices: Prices,
//   vaultImmutableInfo: VaultImmutableInfo,
// ): Promise<Vault> {
//   const currentTimestampInSeconds = Math.floor(new Date().getTime() / 1000)
//   const _5minNormalizedCurrentTimestampInSeconds =
//     currentTimestampInSeconds - (currentTimestampInSeconds % (60 * 5))
//   const _1hourNormalizedCurrentTimestampInSeconds =
//     currentTimestampInSeconds - (currentTimestampInSeconds % (60 * 60))
//
//   const [vault, vaultPerformanceData] = await Promise.all([
//     getPool({
//       chainId: chain.id,
//       token0: vaultImmutableInfo.currencyA.address,
//       token1: vaultImmutableInfo.currencyB.address,
//       salt: vaultImmutableInfo.salt,
//       options: {
//         useSubgraph: true,
//         rpcUrl: CHAIN_CONFIG.RPC_URL,
//       },
//     }),
//     getPoolPerformance({
//       chainId: chain.id,
//       currencyA: vaultImmutableInfo.currencyA,
//       currencyB: vaultImmutableInfo.currencyB,
//       poolKey: vaultImmutableInfo.key,
//       // volume
//       volumeFromTimestamp:
//         _5minNormalizedCurrentTimestampInSeconds - 60 * 60 * 24,
//       volumeToTimestamp: _5minNormalizedCurrentTimestampInSeconds,
//       // performance chart
//       snapshotFromTimestamp:
//         _1hourNormalizedCurrentTimestampInSeconds - 60 * 60 * 24 * 90,
//       snapshotToTimestamp: _1hourNormalizedCurrentTimestampInSeconds,
//       snapshotIntervalType: CHART_LOG_INTERVALS.oneHour,
//       // apy
//       spreadProfitFromTimestamp:
//         _5minNormalizedCurrentTimestampInSeconds - 60 * 60 * 24,
//       spreadProfitToTimestamp: _5minNormalizedCurrentTimestampInSeconds,
//     }),
//   ])
//   const initialLPInfo = vaultImmutableInfo.initialLPInfo ?? {
//     quoteTokenAmount: 1,
//     baseTokenAmount: 1,
//     lpTokenAmount: 1,
//     timestamp: Math.floor(Date.now() / 1000),
//     initialPriceMultiplier: 1e10,
//   }
//   const historicalLpPrices = vaultPerformanceData.poolSnapshots
//     .map(({ price, liquidityA, liquidityB, totalSupply, timestamp }) => {
//       const quotePrice = prices[vault.market.quote.address] ?? 1
//       const basePrice =
//         Number(price) * quotePrice * initialLPInfo.initialPriceMultiplier
//       const onHoldUSDValuePerLp =
//         (initialLPInfo.quoteTokenAmount * quotePrice +
//           initialLPInfo.baseTokenAmount * basePrice) /
//         initialLPInfo.lpTokenAmount
//       const tvl = isAddressEqual(
//         vault.market.base.address,
//         liquidityA.currency.address,
//       )
//         ? Number(liquidityA.value) * basePrice +
//           Number(liquidityB.value) * quotePrice
//         : Number(liquidityB.value) * basePrice +
//           Number(liquidityA.value) * quotePrice
//       const lpPrice =
//         Number(totalSupply.value) === 0 ? 0 : tvl / Number(totalSupply.value)
//       return {
//         lpPrice,
//         time: Number(timestamp),
//         pnl: lpPrice / onHoldUSDValuePerLp,
//       }
//     })
//     .sort((a, b) => a.time - b.time)
//   const firstNonZeroIndex = historicalLpPrices.findIndex(
//     ({ lpPrice }) => lpPrice > 0,
//   )
//   const initialLpPrice =
//     firstNonZeroIndex === -1 ? 1 : historicalLpPrices[firstNonZeroIndex].lpPrice
//   const historicalPriceIndex = historicalLpPrices.map(
//     ({ pnl, lpPrice, time }) => {
//       return {
//         values: [lpPrice !== 0 ? lpPrice / initialLpPrice : 0, pnl, lpPrice, 0],
//         time,
//       }
//     },
//   )
//   const tvl =
//     (prices[vault.currencyA.address] ?? 0) *
//       Number(vault.liquidityA.total.value) +
//     (prices[vault.currencyB.address] ?? 0) *
//       Number(vault.liquidityB.total.value)
//   const firstHistoricalPriceIndex = [
//     ...historicalPriceIndex.slice(firstNonZeroIndex),
//   ].sort((a, b) => a.time - b.time)[0]
//   const lastHistoricalPriceIndex = [
//     ...historicalPriceIndex.slice(firstNonZeroIndex),
//   ].sort((a, b) => b.time - a.time)[0]
//   return {
//     key: vault.key,
//     salt: vaultImmutableInfo.salt,
//     hasDashboard: vaultImmutableInfo.hasDashboard,
//     hasPoint: vaultImmutableInfo.hasPoint,
//     lpCurrency: {
//       address: getContractAddresses({ chainId: chain.id }).Rebalancer,
//       name: `Clober LP ${vault.currencyA.symbol}/${vault.currencyB.symbol}`,
//       symbol: `${vault.currencyA.symbol}/${vault.currencyB.symbol}`,
//       decimals: 18,
//     },
//     lpUsdValue: tvl / Number(vault.totalSupply.value),
//     currencyA: vault.currencyA,
//     currencyB: vault.currencyB,
//     reserveA: Number(vault.liquidityA.total.value),
//     reserveB: Number(vault.liquidityB.total.value),
//     tvl,
//     apy: vaultImmutableInfo.initialLPInfo
//       ? calculateApy(
//           historicalLpPrices.sort((a, b) => b.time - a.time)[0].pnl,
//           currentTimestampInSeconds - initialLPInfo.timestamp,
//         )
//       : Math.max(
//           calculateApy(
//             lastHistoricalPriceIndex.values[2] /
//               firstHistoricalPriceIndex.values[2],
//             lastHistoricalPriceIndex.time - firstHistoricalPriceIndex.time,
//           ),
//           0,
//         ),
//     volume24h: vaultPerformanceData.poolVolumes.reduce(
//       (acc, { currencyAVolume, currencyBVolume }) =>
//         acc +
//         (isAddressEqual(
//           currencyAVolume.currency.address,
//           vault.market.quote.address,
//         )
//           ? Number(currencyAVolume.value) *
//             (prices[vault.currencyA.address] ?? 0)
//           : Number(currencyBVolume.value) *
//             (prices[vault.currencyB.address] ?? 0)),
//       0,
//     ),
//     totalSupply: Number(vault.totalSupply.value),
//     historicalPriceIndex: historicalPriceIndex.slice(
//       firstNonZeroIndex,
//     ) as StackedLineData[],
//   }
// }
