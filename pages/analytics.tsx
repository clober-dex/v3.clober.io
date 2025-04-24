import React, { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { UTCTimestamp } from 'lightweight-charts'
import { getAddress, isAddressEqual } from 'viem'
import { TamaguiProvider } from '@tamagui/web'

import { HistogramChart } from '../components/chart/histogram-chart'
import { useChainContext } from '../contexts/chain-context'
import { useCurrencyContext } from '../contexts/currency-context'
import RedirectIfNotMonadTestnetContainer from '../containers/redirect-if-not-monad-testnet-container'
import { Loading } from '../components/loading'
import tamaguiConfig from '../tamagui.config'
import { Chart } from '../components/chart/chart-model'
import { ChartHeader } from '../components/chart/chart-header'
import { StackedChartModel } from '../components/chart/stacked/stacked-chart-model'

export default function Analytics() {
  const { prices, whitelistCurrencies } = useCurrencyContext()
  const { selectedChain } = useChainContext()

  const { data: analytics } = useQuery({
    queryKey: ['analytics', selectedChain.id],
    queryFn: async () => {
      try {
        const {
          data: { snapshots },
        } = await axios.get<{
          snapshots: {
            timestamp: number
            googleAnalyticsActiveUsers: {
              returning: number
              new: number
            }
            walletCount: number
            transactionCount: number
            volumeSnapshots: {
              symbol: string
              amount: number
              address: `0x${string}`
            }[]
          }[]
        }>(`/api/chains/${selectedChain.id}/analytics`)
        return snapshots.sort((a, b) => a.timestamp - b.timestamp)
      } catch {
        return []
      }
    },
    initialData: [],
  })

  const retentionRate = useMemo(
    () =>
      [
        { date: '2025-03-09', value: 100 },
        { date: '2025-03-16', value: 17.2 },
        { date: '2025-03-23', value: 13.9 },
        { date: '2025-03-30', value: 11.7 },
        { date: '2025-04-06', value: 12.7 },
        { date: '2025-04-13', value: 13.0 },
      ].map((item) => ({
        time: Math.floor(
          new Date(item.date).getTime() / 1000,
        ) as unknown as UTCTimestamp,
        values: [item.value, 0],
      })),
    [],
  )

  const tokenColorMap = useMemo(() => {
    return Object.fromEntries(
      [
        ...new Set(
          analytics
            .map((item) =>
              item.volumeSnapshots.map(({ address }) => getAddress(address)),
            )
            .flat(),
        ),
      ]
        .sort()
        .map((address, index) => [
          getAddress(address),
          `hsl(${(index * 137.508) % 360}, 100%, 50%)`,
        ]),
    )
  }, [analytics])

  return (
    <RedirectIfNotMonadTestnetContainer>
      {analytics.length > 0 && (
        <div className="flex flex-col w-full h-full items-center justify-center gap-8 px-16 pb-16">
          <div className="flex w-full h-12 sm:h-[72px] flex-col justify-start items-center gap-2 sm:gap-3">
            <div className="self-stretch text-center text-white text-lg sm:text-4xl font-bold">
              Monad Testnet Analytics
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex flex-col flex-1">
              <div className="text-white text-sm md:text-base font-bold">
                Daily Active Users
              </div>

              <div className="flex w-[350px] sm:w-[500px]">
                <HistogramChart
                  data={analytics.map((item) => ({
                    time: item.timestamp as UTCTimestamp,
                    values: {
                      Returning: item.googleAnalyticsActiveUsers.returning,
                      New: item.googleAnalyticsActiveUsers.new,
                    },
                  }))}
                  colors={[
                    { label: 'New', color: '#40DE7A' },
                    { label: 'Returning', color: '#3B82F6' },
                  ]}
                  height={312}
                />
              </div>
            </div>

            <div className="flex flex-col flex-1">
              <div className="text-white text-sm md:text-base font-bold">
                Daily Volume
              </div>

              <div className="flex w-[350px] sm:w-[500px]">
                <HistogramChart
                  prefix={'$'}
                  data={analytics.map((item) => {
                    const values = item.volumeSnapshots
                      .map(({ amount, address }) => [
                        whitelistCurrencies.find((currency) =>
                          isAddressEqual(
                            getAddress(currency.address),
                            getAddress(address),
                          ),
                        )?.symbol,
                        amount * (prices[getAddress(address)] ?? 0),
                      ])
                      .filter(([symbol]) => symbol !== undefined)
                      .sort()
                    return {
                      time: item.timestamp as UTCTimestamp,
                      values: {
                        ...Object.fromEntries(values),
                      },
                    }
                  })}
                  colors={
                    Object.entries(tokenColorMap)
                      .map(([address, color]) => ({
                        label: whitelistCurrencies.find((currency) =>
                          isAddressEqual(
                            getAddress(currency.address),
                            getAddress(address),
                          ),
                        )?.symbol,
                        color,
                      }))
                      .filter(({ label }) => label !== undefined)
                      .sort() as any
                  }
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
                  data={analytics.map((item) => ({
                    time: item.timestamp as UTCTimestamp,
                    values: { Wallet: item.walletCount },
                  }))}
                  colors={[{ label: 'Wallet', color: '#A457FF' }]}
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
                  data={analytics.map((item) => ({
                    time: item.timestamp as UTCTimestamp,
                    values: { Transaction: item.transactionCount },
                  }))}
                  colors={[{ label: 'Transaction', color: '#FC72FF' }]}
                  height={312}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex flex-col flex-1">
              <div className="text-white text-sm md:text-base font-bold">
                Retention Rate
              </div>

              <div className="flex w-[350px] sm:w-[500px]">
                <TamaguiProvider
                  config={tamaguiConfig}
                  disableInjectCSS
                  disableRootThemeClass
                >
                  {(() => {
                    return (
                      <Chart
                        Model={StackedChartModel}
                        params={
                          {
                            data: retentionRate,
                            colors: ['#4C82FB', '#FC72FF'],
                            gradients: [
                              {
                                start: 'rgba(96, 123, 238, 0.20)',
                                end: 'rgba(55, 70, 136, 0.00)',
                              },
                              {
                                start: 'rgba(252, 116, 254, 0.20)',
                                end: 'rgba(252, 116, 254, 0.00)',
                              },
                            ],
                          } as any
                        }
                        height={368}
                      >
                        {(crosshairData) => {
                          const value = crosshairData
                            ? crosshairData.values[0]
                            : (retentionRate[retentionRate.length - 1] as any)
                                .values[0]
                          return (
                            <ChartHeader
                              value={`${value.toFixed(2)}%`}
                              time={crosshairData?.time as any}
                              detailData={[
                                {
                                  label: 'rate',
                                  color: '#FC72FF',
                                  value: `${(
                                    (crosshairData as any)?.values[0] ?? 0
                                  ).toFixed(2)}%`,
                                },
                              ]}
                            />
                          )
                        }}
                      </Chart>
                    )
                  })()}
                </TamaguiProvider>
              </div>
            </div>

            <div className="flex flex-col flex-1">
              <div className="text-white text-sm md:text-base font-bold"></div>

              <div className="flex w-[350px] sm:w-[500px]"></div>
            </div>
          </div>
        </div>
      )}

      {analytics.length === 0 && <Loading />}
    </RedirectIfNotMonadTestnetContainer>
  )
}
