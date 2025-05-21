import React, { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAddress, isAddressEqual, zeroAddress } from 'viem'
import { UTCTimestamp } from 'lightweight-charts'
import { Currency, getProtocolAnalytics } from '@clober/v2-sdk'
import { AnalyticsSummary } from '@clober/v2-sdk/dist/types/entities/analytics/types'

import { useChainContext } from '../contexts/chain-context'
import RedirectIfNotMonadTestnetContainer from '../containers/redirect-if-not-monad-testnet-container'
import { HistogramChart } from '../components/chart/histogram-chart'
import { Loading } from '../components/loading'

const buildCurrencyLabel = (currency: Currency): string =>
  `${currency.symbol}(${currency.address.slice(2, 6).toLowerCase()})`

const BLACKLISTED_VOLUME_ENTRIES = [
  { timestamp: 1743638400, address: zeroAddress },
  {
    timestamp: 1743638400,
    address: getAddress('0xb2f82D0f38dc453D596Ad40A37799446Cc89274A'),
  },
]

export default function Analytics() {
  const { selectedChain } = useChainContext()

  const { data: analytics } = useQuery({
    queryKey: ['analytics', selectedChain.id],
    queryFn: async () => {
      return getProtocolAnalytics({ chainId: selectedChain.id })
    },
    initialData: null,
  }) as {
    data: AnalyticsSummary | null
  }

  const uniqueCurrencies = useMemo(() => {
    const currencies = (analytics?.analyticsSnapshots ?? []).flatMap((item) =>
      Object.values(item.volume24hUSDMap).map(({ currency }) => currency),
    )
    return currencies.filter(
      (currency, index, self) =>
        index ===
        self.findIndex((c) => isAddressEqual(c.address, currency.address)),
    )
  }, [analytics])

  const tokenColorMap = useMemo(() => {
    return {
      ...Object.fromEntries(
        uniqueCurrencies.map((currency, index) => {
          const baseHue = (index * 47) % 360
          const hue = (baseHue + (index % 2) * 240) % 360
          return [getAddress(currency.address), `hsl(${hue}, 70%, 50%)`]
        }),
      ),
      ...{
        ['0x0000000000000000000000000000000000000000']: '#FC72FF',
        [getAddress('0xf817257fed379853cDe0fa4F97AB987181B1E5Ea')]: '#4C82FB',
      },
    }
  }, [uniqueCurrencies]) as Record<`0x${string}`, string>

  const transactionTypeColorMap = useMemo(() => {
    const transactionTypes = [
      ...new Set(
        (analytics?.analyticsSnapshots ?? []).flatMap((item) =>
          Object.keys(item.transactionTypeCounts).map((type) => type),
        ),
      ),
    ].sort()

    return Object.fromEntries(
      transactionTypes.map((type, index) => {
        const baseHue = (index * 47) % 360
        const hue = (baseHue + (index % 2) * 180) % 360
        return [type, `hsl(${hue}, 70%, 50%)`]
      }),
    )
  }, [analytics])

  const totalValueLockedUSD = useMemo(() => {
    return (analytics?.analyticsSnapshots ?? []).reduce((acc, item) => {
      const values = Object.entries(item.volume24hUSDMap).filter(
        ([address]) =>
          !BLACKLISTED_VOLUME_ENTRIES.some(
            (blacklist) =>
              blacklist.timestamp === item.timestamp &&
              isAddressEqual(blacklist.address, getAddress(address)),
          ),
      )
      return acc + values.reduce((acc, [, { usd }]) => acc + usd, 0)
    }, 0)
  }, [analytics])

  const totalProtocolFeesUSD = useMemo(() => {
    return (analytics?.analyticsSnapshots ?? []).reduce((acc, item) => {
      const values = Object.entries(item.protocolFees24hUSDMap).filter(
        ([address]) =>
          !BLACKLISTED_VOLUME_ENTRIES.some(
            (blacklist) =>
              blacklist.timestamp === item.timestamp &&
              isAddressEqual(blacklist.address, getAddress(address)),
          ),
      )
      return acc + values.reduce((acc, [, { usd }]) => acc + usd, 0)
    }, 0)
  }, [analytics])

  return (
    <RedirectIfNotMonadTestnetContainer>
      {analytics && (
        <div className="flex flex-col w-full h-full items-center justify-center gap-8 px-16 pb-16">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex flex-col">
              <div className="text-white text-sm md:text-base font-bold">
                Daily Volume
              </div>

              <div className="flex w-[350px] sm:w-[1016px]">
                <HistogramChart
                  prefix={'$'}
                  data={(analytics?.analyticsSnapshots ?? [])
                    .map((item) => {
                      // filter out blacklisted addresses in that timestamp
                      const values = Object.entries(item.volume24hUSDMap)
                        .filter(
                          ([address]) =>
                            !BLACKLISTED_VOLUME_ENTRIES.some(
                              (blacklist) =>
                                blacklist.timestamp === item.timestamp &&
                                isAddressEqual(
                                  blacklist.address,
                                  getAddress(address),
                                ),
                            ),
                        )
                        .map(
                          ([, { currency, usd }]) =>
                            [buildCurrencyLabel(currency), usd] as [
                              string,
                              number,
                            ],
                        )
                      return {
                        time: item.timestamp as UTCTimestamp,
                        values: {
                          ...Object.fromEntries(values),
                        },
                      }
                    })
                    .sort((a, b) => a.time - b.time)}
                  colors={
                    Object.entries(tokenColorMap)
                      .map(([address, color]) => {
                        const currency = uniqueCurrencies.find((currency) =>
                          isAddressEqual(
                            getAddress(currency.address),
                            getAddress(address),
                          ),
                        )
                        if (!currency) {
                          return null
                        }
                        return {
                          label: buildCurrencyLabel(currency),
                          color,
                        }
                      })
                      .filter(
                        (item): item is { label: string; color: string } =>
                          !!item,
                      )
                      .sort() as { label: string; color: string }[]
                  }
                  defaultValue={totalValueLockedUSD}
                  height={312}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex flex-col flex-1">
              <div className="text-white text-sm md:text-base font-bold">
                Daily Active Wallets
              </div>

              <div className="flex w-[350px] sm:w-[500px]">
                <HistogramChart
                  data={(analytics?.analyticsSnapshots ?? []).map((item) => ({
                    time: item.timestamp as UTCTimestamp,
                    values: {
                      Returning: item.activeUsers - item.firstTimeUsers,
                      New: item.firstTimeUsers,
                    },
                  }))}
                  colors={[
                    { label: 'New', color: '#40DE7A' },
                    { label: 'Returning', color: '#3B82F6' },
                  ]}
                  defaultValue={analytics?.accumulatedUniqueTransactions ?? 0}
                  height={312}
                />
              </div>
            </div>

            <div className="flex flex-col flex-1">
              <div className="text-white text-sm md:text-base font-bold">
                Daily Transactions
              </div>

              <div className="flex w-[350px] sm:w-[500px]">
                <HistogramChart
                  data={(analytics?.analyticsSnapshots ?? []).map((item) => ({
                    time: item.timestamp as UTCTimestamp,
                    values: item.transactionTypeCounts,
                  }))}
                  colors={Object.entries(transactionTypeColorMap)
                    .filter(([type]) => type !== 'unknown')
                    .map(([type, color]) => ({
                      label: type,
                      color,
                    }))}
                  defaultValue={analytics?.accumulatedUniqueTransactions ?? 0}
                  height={312}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex flex-col">
              <div className="text-white text-sm md:text-base font-bold">
                Daily Protocol Fees
              </div>

              <div className="flex w-[350px] sm:w-[1016px]">
                <HistogramChart
                  prefix={'$'}
                  data={(analytics?.analyticsSnapshots ?? [])
                    .map((item) => {
                      // filter out blacklisted addresses in that timestamp
                      const values = Object.entries(item.protocolFees24hUSDMap)
                        .filter(
                          ([address]) =>
                            !BLACKLISTED_VOLUME_ENTRIES.some(
                              (blacklist) =>
                                blacklist.timestamp === item.timestamp &&
                                isAddressEqual(
                                  blacklist.address,
                                  getAddress(address),
                                ),
                            ),
                        )
                        .map(
                          ([, { currency, usd }]) =>
                            [buildCurrencyLabel(currency), usd] as [
                              string,
                              number,
                            ],
                        )
                      return {
                        time: item.timestamp as UTCTimestamp,
                        values: {
                          ...Object.fromEntries(values),
                        },
                      }
                    })
                    .sort((a, b) => a.time - b.time)}
                  colors={
                    Object.entries(tokenColorMap)
                      .map(([address, color]) => {
                        const currency = uniqueCurrencies.find((currency) =>
                          isAddressEqual(
                            getAddress(currency.address),
                            getAddress(address),
                          ),
                        )
                        if (!currency) {
                          return null
                        }
                        return {
                          label: buildCurrencyLabel(currency),
                          color,
                        }
                      })
                      .filter(
                        (item): item is { label: string; color: string } =>
                          !!item,
                      )
                      .sort() as { label: string; color: string }[]
                  }
                  defaultValue={totalProtocolFeesUSD}
                  height={312}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex flex-col">
              <div className="text-white text-sm md:text-base font-bold">
                Daily TVL
              </div>

              <div className="flex w-[350px] sm:w-[1016px]">
                <HistogramChart
                  prefix={'$'}
                  data={(analytics?.analyticsSnapshots ?? [])
                    .map((item) => {
                      // filter out blacklisted addresses in that timestamp
                      const values = Object.entries(item.totalValueLockedUSDMap)
                        .filter(
                          ([address]) =>
                            !BLACKLISTED_VOLUME_ENTRIES.some(
                              (blacklist) =>
                                blacklist.timestamp === item.timestamp &&
                                isAddressEqual(
                                  blacklist.address,
                                  getAddress(address),
                                ),
                            ),
                        )
                        .map(
                          ([, { currency, usd }]) =>
                            [buildCurrencyLabel(currency), usd] as [
                              string,
                              number,
                            ],
                        )
                      return {
                        time: item.timestamp as UTCTimestamp,
                        values: {
                          ...Object.fromEntries(values),
                        },
                      }
                    })
                    .sort((a, b) => a.time - b.time)}
                  colors={
                    Object.entries(tokenColorMap)
                      .map(([address, color]) => {
                        const currency = uniqueCurrencies.find((currency) =>
                          isAddressEqual(
                            getAddress(currency.address),
                            getAddress(address),
                          ),
                        )
                        if (!currency) {
                          return null
                        }
                        return {
                          label: buildCurrencyLabel(currency),
                          color,
                        }
                      })
                      .filter(
                        (item): item is { label: string; color: string } =>
                          !!item,
                      )
                      .sort() as { label: string; color: string }[]
                  }
                  defaultValue={
                    analytics?.analyticsSnapshots.sort(
                      (a, b) => a.timestamp - b.timestamp,
                    )?.[0].totalValueLockedUSD ?? 0
                  }
                  height={312}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {!analytics && <Loading />}
    </RedirectIfNotMonadTestnetContainer>
  )
}
