import React, { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAddress, isAddressEqual } from 'viem'
import { UTCTimestamp } from 'lightweight-charts'

import { useChainContext } from '../contexts/chain-context'
import { useCurrencyContext } from '../contexts/currency-context'
import { fetchDailyActivitySnapshot } from '../apis/analytics'
import RedirectIfNotMonadTestnetContainer from '../containers/redirect-if-not-monad-testnet-container'
import { HistogramChart } from '../components/chart/histogram-chart'
import { Loading } from '../components/loading'

export default function Analytics() {
  const { prices, whitelistCurrencies } = useCurrencyContext()
  const { selectedChain } = useChainContext()

  const { data: analytics } = useQuery({
    queryKey: ['analytics', selectedChain.id],
    queryFn: async () => {
      return fetchDailyActivitySnapshot(selectedChain)
    },
    initialData: [],
  })

  const tokenColorMap = useMemo(() => {
    const addresses = [
      ...new Set(
        analytics.flatMap((item) =>
          item.volumeSnapshots.map(({ address }) => getAddress(address)),
        ),
      ),
    ].sort()

    return Object.fromEntries(
      addresses.map((address, index) => {
        const baseHue = (index * 47) % 360
        const hue = (baseHue + (index % 2) * 180) % 360
        return [address, `hsl(${hue}, 70%, 50%)`]
      }),
    )
  }, [analytics])

  const transactionTypeColorMap = useMemo(() => {
    const transactionTypes = [
      ...new Set(
        analytics.flatMap((item) =>
          item.transactionTypeSnapshots.map(({ type }) => type),
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
            <div className="flex flex-col">
              <div className="text-white text-sm md:text-base font-bold">
                Daily Volume
              </div>

              <div className="flex w-[350px] sm:w-[1016px]">
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
                    values: {
                      Returning: item.walletCount - item.newWalletCount,
                      New: item.newWalletCount,
                    },
                  }))}
                  colors={[
                    { label: 'New', color: '#40DE7A' },
                    { label: 'Returning', color: '#3B82F6' },
                  ]}
                  defaultValue={analytics.reduce(
                    (acc, item) => acc + (item.newWalletCount ?? 0),
                    0,
                  )}
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
                    values: Object.fromEntries(
                      item.transactionTypeSnapshots.map(({ type, count }) => [
                        type,
                        count,
                      ]),
                    ),
                  }))}
                  colors={Object.entries(transactionTypeColorMap).map(
                    ([type, color]) => ({
                      label: type,
                      color,
                    }),
                  )}
                  defaultValue={analytics.reduce(
                    (acc, item) => acc + (item.transactionCount ?? 0),
                    0,
                  )}
                  height={312}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {analytics.length === 0 && <Loading />}
    </RedirectIfNotMonadTestnetContainer>
  )
}
